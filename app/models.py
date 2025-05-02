from .extensions import db
from config import GOOGLE_API_KEY
from datetime import date, datetime, timezone
from flask_login import UserMixin
from geodistpy import geodist
import math
import requests
from sqlalchemy import or_, text
from typing import Optional

# Association table for listing tags
listing_tags = db.Table(
    'listing_tags',
    db.Column('listing_id', db.Integer, db.ForeignKey('listings.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

# Association table for user tags
user_tags = db.Table(
    'user_tags',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

# Association table for blocks (user A blocks user B)
blocks = db.Table(
    'blocks',
    db.Column('blocker_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('blocked_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)

#Association tabke for discussions
chat_members = db.Table('chat_members',
    db.Column('chat_id', db.Integer, db.ForeignKey('chats.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)

# Association table for each locations' listings
location_listings = db.Table("location_listings",
    db.Column("location_id", db.Integer, db.ForeignKey("locations.id"), primary_key = True),
    db.Column("listing_id", db.Integer, db.ForeignKey("listings.id"), primary_key = True)
)


class Swipe(db.Model):
    __tablename__ = 'swipes'
    id: int = db.Column(db.Integer, primary_key=True)
    swiped_by_listing_id: int = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
    swiped_on_listing_id: int = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
    is_right_swipe: bool = db.Column(db.Boolean, nullable=False)
    timestamp: datetime = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    swiped_by_listing = db.relationship(
        'Listing',
        foreign_keys=[swiped_by_listing_id],
        backref='swipes_made'
    )
    swiped_on_listing = db.relationship(
        'Listing',
        foreign_keys=[swiped_on_listing_id],
        backref='swipes_received'
    )

    @classmethod
    def swipe(cls, swiped_by_listing, swiped_on_listing, is_right_swipe):
        """
        Creates a swipe record using listing objects.
        If it's a right swipe, checks for a reciprocal right swipe to create a match.
        """
        new_swipe = cls(
            swiped_by_listing_id=swiped_by_listing.id,
            swiped_on_listing_id=swiped_on_listing.id,
            is_right_swipe=is_right_swipe
        )
        db.session.add(new_swipe)
        db.session.commit()

        if is_right_swipe:
            reciprocal_swipe = cls.query.filter_by(
                swiped_by_listing_id=swiped_on_listing.id,
                swiped_on_listing_id=swiped_by_listing.id,
                is_right_swipe=True
            ).first()
            if reciprocal_swipe:
                Match.create_match(swiped_by_listing, swiped_on_listing)
        return new_swipe

class Match(db.Model):
    __tablename__ = 'matches'
    id: int = db.Column(db.Integer, primary_key=True)
    listing1_id: int = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
    listing2_id: int = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
    matched_on: datetime = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    listing1 = db.relationship('Listing', foreign_keys=[listing1_id])
    listing2 = db.relationship('Listing', foreign_keys=[listing2_id])

    @classmethod
    def create_match(cls, listing_a, listing_b):
        """
        Creates a match between two listing objects.
        To maintain consistency, orders the listing IDs.
        """
        d1, d2 = sorted([listing_a.id, listing_b.id])
        existing_match = cls.query.filter_by(listing1_id=d1, listing2_id=d2).first()
        if not existing_match:
            new_match = cls(
                listing1_id=d1,
                listing2_id=d2
            )
            db.session.add(new_match)
            db.session.commit()
            return new_match
        return existing_match

class Listing(db.Model):
    __tablename__ = 'listings'
    id: int = db.Column(db.Integer, primary_key=True)
    user_id: int = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category: str = db.Column(db.String(20), nullable=False)  # 'short', 'long', or 'hosting'
    start_date: date = db.Column(db.Date, nullable=False)
    end_date: Optional[date] = db.Column(db.Date, nullable=True)
    dates_are_approximate: bool = db.Column(db.Boolean, default=True)
    nightly_budget: Optional[float] = db.Column(db.Float, nullable=True)
    currency: Optional[str] = db.Column(db.String(3), nullable=True)
    description: Optional[str] = db.Column(db.Text, nullable=True)
    is_complete: bool = db.Column(db.Boolean, nullable = False, default = False)
    # Indicates if only users of the same gender should be considered
    prefers_same_gender: bool = db.Column(db.Boolean, default=False)
    timestamp: datetime = db.Column(db.DateTime, index=True, default=datetime.now(timezone.utc))

    # Relationships
    creator = db.relationship('User', back_populates='listings')
    tags = db.relationship('Tag', secondary=listing_tags, back_populates='listings')
    location = db.relationship("Location", secondary = location_listings, back_populates = "listings")
    
    def to_dict(self, for_javascript: bool = True):
        return {
            "id": self.id,
            "userId": self.user_id,
            "category": self.category,
            "startDate": self.start_date,
            "endDate": self.end_date,
            "datesAreApproximate": self.dates_are_approximate,
            "nightlyBudget": self.nightly_budget,
            "currency": self.currency,
            "description": self.description,
            "isComplete": self.is_complete,
            "prefersSameGender": self.prefers_same_gender,
            "timestamp": self.timestamp
        } if for_javascript else {
            "id": self.id,
            "user_id": self.user_id,
            "category": self.category,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "dates_are_approximate": self.dates_are_approximate,
            "nightly_budget": self.nightly_budget,
            "currency": self.currency,
            "description": self.description,
            "is_complete": self.is_complete,
            "prefers_same_gender": self.prefers_same_gender,
            "timestamp": self.timestamp
        }

class Tag(db.Model):
    __tablename__ = 'tags'
    id: int = db.Column(db.Integer, primary_key=True)
    name: str = db.Column(db.String(50), unique=True, nullable=False)

    # Relationships for both listings and users
    listings = db.relationship('Listing', secondary=listing_tags, back_populates='tags')
    users = db.relationship('User', secondary=user_tags, back_populates='tags')

class ProfilePicture(db.Model):
    __tablename__ = 'profile_pictures'
    id: int = db.Column(db.Integer, primary_key=True)
    user_id: int = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    image_data: bytes = db.Column(db.LargeBinary, nullable=False)
    image_mimetype: str = db.Column(db.String(255), nullable=False)
    timestamp: datetime = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    # Relationship back to the user
    user = db.relationship('User', back_populates='profile_pictures')

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id: int = db.Column(db.Integer, primary_key=True)
    email: str = db.Column(db.String(150), unique=True, nullable=False)
    password: str = db.Column(db.String(150), nullable=False)
    username: str = db.Column(db.String(150), unique=True, nullable=False)
    first_name: str = db.Column(db.String(150), nullable = False)
    last_name: str = db.Column(db.String(150), nullable = False)
    birthday: date = db.Column(db.Date, nullable=False)
    creation_date: date = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    phone_number: Optional[str] = db.Column(db.String(20), nullable=True, unique=True)
    bio: Optional[str] = db.Column(db.String(500), nullable=True)
    gender: str = db.Column(db.String(20), nullable=False)

    premium: bool = db.Column(db.Boolean, nullable=False, default=False, server_default=text('false'))
    is_public: bool = db.Column(db.Boolean, nullable=False, default=False, server_default=text('false'))

    __table_args__ = (
        db.UniqueConstraint('phone_number', name='uq_users_phone_number'),
    )

    # Relationships
    listings = db.relationship('Listing', back_populates='creator', lazy='dynamic')
    profile_pictures = db.relationship('ProfilePicture', back_populates='user', lazy='dynamic')
    tags = db.relationship('Tag', secondary=user_tags, back_populates='users')
    # swipes_made = db.relationship('Swipe', foreign_keys='Swipe.swiped_by_listing_id', back_populates='swiped_by_listing', lazy='dynamic')
    # swipes_received = db.relationship('Swipe', foreign_keys='Swipe.swiped_on_listing_id', back_populates='swiped_on_listing', lazy='dynamic')
    #this is commented out assuming that we will access user swipes through their desinations, thus the backref in listings is sufficient, however
    # if we need to access all the swipes across all listings direclty from jsut the user, we will need to use backpopulates one each side of the 
    # relationship 
    
    outgoing_friend_requests = db.relationship(
        "User",
        secondary = "friendships",
        primaryjoin = "Friendship.requester_id == User.id",
        secondaryjoin = "and_(Friendship.status == 'pending', Friendship.receiver_id == User.id)",
        lazy = "dynamic",
        viewonly = True
    )
    
    accepted_outgoing_friend_requests = db.relationship(
        "User",
        secondary = "friendships",
        primaryjoin = "and_(Friendship.requester_id == User.id, Friendship.status == 'accepted')",
        secondaryjoin = "User.id == Friendship.receiver_id",
        lazy = "dynamic",
        viewonly = True
    )
    
    incoming_friend_requests = db.relationship(
        "User",
        secondary = "friendships",
        primaryjoin = "Friendship.receiver_id == User.id",
        secondaryjoin = "and_(Friendship.status == 'pending', Friendship.requester_id == User.id)",
        lazy = "dynamic",
        viewonly = True
    )
    
    accepted_incoming_friend_requests = db.relationship(
        "User",
        secondary = "friendships",
        primaryjoin = "and_(Friendship.receiver_id == User.id, Friendship.status == 'accepted')",
        secondaryjoin = "User.id == Friendship.requester_id",
        lazy = "dynamic",
        viewonly = True
    )
    
    @property
    def accepted_friend_requests(self):
        return self.accepted_outgoing_friend_requests.union(self.accepted_incoming_friend_requests)
    
    # Users that this user has blocked; the blocked users will also have a 'blocked_by' attribute via backref
    blocked_users = db.relationship(
        'User',
        secondary=blocks,
        primaryjoin=(blocks.c.blocker_id == id),
        secondaryjoin=(blocks.c.blocked_id == id),
        backref='blocked_by',
        lazy='dynamic'
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "username": self.username,
            "email": self.email
        }
    
    def get_all_friendships(self):
        """Retrieve all pending, accepted, and declined friendships."""
        friendships = db.session.execute(
            db.select(Friendship)
            .where(
                or_(
                    Friendship.requester_id == self.id,
                    Friendship.receiver_id == self.id
                )
            )
        ).scalars().all()
        
        return friendships
    
    def send_friend_request(self, to_user: "User"):
        if self.id == to_user.id:
            raise ValueError("Cannot send a friend request to yourself.")
        
        existing_sent = db.session.execute(
            db.select(Friendship)
            .filter_by(requester_id = self.id, receiver_id = to_user.id)
        ).scalar_one_or_none()
        existing_received = db.session.execute(
            db.select(Friendship)
            .filter_by(requester_id = to_user.id, receiver_id = self.id)
        ).scalar_one_or_none()

        if existing_sent:
            if existing_sent.status == "declined":
                try:
                    existing_sent.status = "pending"
                    existing_sent.timestamp = datetime.now(timezone.utc)
                    db.session.commit()
                    return
                except Exception as error:
                    db.session.rollback()
                    print("Error updating friend request to pending:", error)
                    raise Exception(error)
            else:
                raise ValueError("Friend request already exists or you're already friends.")
        elif existing_received:
            raise ValueError("Incoming friend request already exists.")
        
        try:
            friend_request = Friendship(
                requester_id = self.id,
                receiver_id = to_user.id,
                status = "pending",
                timestamp=datetime.now(timezone.utc)
            )
            db.session.add(friend_request)
            db.session.commit()
        except Exception as error:
            db.session.rollback()
            print("Error sending friend request:", error)
            
            raise Exception(error)
    
    def accept_friend_request(self, from_user: "User"):
        friendship = db.session.execute(
            db.select(Friendship)
            .filter_by(requester_id = from_user.id, receiver_id = self.id, status = "pending")
        ).scalar_one_or_none()
        
        if friendship:
            try:
                friendship.status = "accepted"
                db.session.commit()
            except Exception as error:
                db.session.rollback()
                print("Error accepting friend request:", error)
                raise Exception(error)
        else:
            raise ValueError("No pending friend request from this user.")
    
    def decline_friend_request(self, from_user: "User"):
        friendship = db.session.execute(
            db.select(Friendship)
            .filter_by(requester_id = from_user.id, receiver_id = self.id, status = "pending")
        ).scalar_one_or_none()
        
        if friendship:
            try:
                friendship.status = "declined"
                db.session.commit()
            except Exception as error:
                db.session.rollback()
                print("Error declining friend request:", error)
                raise Exception(error)
        else:
            raise ValueError("No pending friend request from this user.")
    
    def remove_friend(self, friend: "User"):
        query1 = (
            db.select(Friendship)
            .filter_by(requester_id = friend.id, receiver_id = self.id, status = "accepted")
        )
        query2 = (
            db.select(Friendship)
            .filter_by(requester_id = self.id, receiver_id = friend.id, status = "accepted")
        )
        
        friendship = db.session.execute(query1).scalar_one_or_none() or db.session.execute(query2).scalar_one_or_none()
        
        if friendship:
            try:
                db.session.delete(friendship)
                db.session.commit()
            except Exception as error:
                db.session.rollback()
                print("Error removing friendship:", error)
                raise Exception(error)
        else:
            raise ValueError("No friendship found between these users.")

    def get_request_status_with(self, other_user: "User"):
        query1 = (
            db.select(Friendship)
            .filter_by(requester_id = other_user.id, receiver_id = self.id)
        )
        query2 = (
            db.select(Friendship)
            .filter_by(requester_id = self.id, receiver_id = other_user.id)
        )
        
        friendship = db.session.execute(query1).scalar_one_or_none() or db.session.execute(query2).scalar_one_or_none()

        if friendship:
            return {
                "status": friendship.status,
                "requester_id": friendship.requester_id,
                "timestamp": friendship.timestamp
            }

        return None
    
    def get_listing_ids(self):
        """Return a list of all listing IDs associated with this user."""
        return [listing.id for listing in self.listings.all()]

class Chat(db.Model):
    __tablename__ = 'chats'

    id: int = db.Column(db.Integer, primary_key=True)
    title: Optional[str] = db.Column(db.String(100), nullable=True)
    is_group: bool = db.Column(db.Boolean, nullable=False, default=False)
    created_at: datetime = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    members = db.relationship('User', secondary=chat_members,
        backref=db.backref('chats', lazy='dynamic'))

    messages = db.relationship('Message', backref='chat', lazy='dynamic', cascade='all, delete-orphan')

    def latest_message(self):
        return self.messages.order_by(Message.timestamp.desc()).first()

    def to_dict(self, include_latest=False):
        data = {
            "id": self.id,
            "title": self.title,
            "is_group": self.is_group,
            "member_ids": [u.id for u in self.members],
            "created_at": self.created_at.isoformat(),
        }

        if include_latest:
            latest = self.latest_message()
            data["latest_message"] = latest.content if latest else ""
            data["latest_time"] = latest.timestamp.isoformat() if latest else None

        return data

class Message(db.Model):
    __tablename__ = 'messages'

    id: int = db.Column(db.Integer, primary_key=True)
    sender_id: int = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    chat_id: int = db.Column(db.Integer, db.ForeignKey('chats.id'), nullable=False)
    content: str = db.Column(db.Text, nullable=False)
    file_url: Optional[str] = db.Column(db.String(255), nullable=True) 
    seen: bool = db.Column(db.Boolean, nullable = False, default = False)
    timestamp: datetime = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    sender = db.relationship('User', foreign_keys=[sender_id])  
    # Not deleting this line, as it was added (when we called discussion conversasions) to link chats to certain listings
    # I'm not sure if we want the chats to be independant of listings or not so leaving this here for future me 
    reactions = db.relationship('Reaction', backref='message', lazy='dynamic')

    def to_dict(self):
        return {
            "id": self.id,
            "senderId": self.sender_id,
            "senderUsername": self.sender.username,
            "senderProfilePicUrl": f"/api/users/{self.sender_id}/profile-picture",
            "chatId": self.chat_id,  # renamed to match frontend
            "content": self.content,
            "fileUrl": self.file_url,
            "seen": self.seen,
            "timestamp": self.timestamp.isoformat()
        }

    def to_reactions(self):
        """
        Returns the reactions
        """
        return {
            "reactions": [reaction.to_dict() for reaction in self.reactions.all()]
        }
    def react(self, user, reaction_type):
        """
        Add or update a reaction from a user.
        """
        reaction = self.reactions.filter_by(user_id=user.id).first()
        if reaction:
            reaction.reaction_type = reaction_type
        else:
            
            reaction = Reaction(message_id=self.id, user_id=user.id, reaction_type=reaction_type)
            db.session.add(reaction)
        db.session.commit()

    def unreact(self, user):
        """
        Remove a user's reaction.
        """
        reaction = self.reactions.filter_by(user_id=user.id).first()
        if reaction:
            db.session.delete(reaction)
            db.session.commit()

class Reaction(db.Model):
    __tablename__ = 'reactions'
    id: int = db.Column(db.Integer, primary_key=True)
    message_id: int = db.Column(db.Integer, db.ForeignKey('messages.id'), nullable=False)
    user_id: int = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reaction_type: str = db.Column(db.String(20), nullable=False)  
    timestamp: datetime = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    def to_dict(self):
        """
        Implement tmr I'm dead rn
        """

class Rating(db.Model):
    __tablename__ = 'ratings'
    id: int = db.Column(db.Integer, primary_key = True)
    listing_id: int = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
    rater_id: int = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
    rating: int = db.Column(db.Integer, nullable=False)

    listing = db.relationship('Listing', foreign_keys=[listing_id])
    rater = db.relationship("Listing", foreign_keys=[rater_id])

    @classmethod
    def rate(cls, listing, rater, rating):
        new_rating = cls(
            listing_id = listing.id,
            rater_id = rater.id,
            rating = rating
        )
        db.session.add(new_rating)
        db.session.commit()

class Location(db.Model):
    __tablename__ = "locations"

    id: int = db.Column(db.Integer, primary_key = True)
    name: Optional[str] = db.Column(db.String(30), nullable = True)
    latitude: float = db.Column(db.Float, nullable = False)
    longitude: float = db.Column(db.Float, nullable = False)
    country: Optional[str] = db.Column(db.String(2), nullable = True)
    locality: Optional[str] = db.Column(db.String(50), nullable = True)
    
    listings = db.relationship("Listing", secondary = location_listings, back_populates = "location", lazy = "dynamic")

    @classmethod
    def get_location_data(cls, latitude: float, longitude: float) -> tuple[str, None] | tuple[None, str]:
        response = requests.get(f"https://maps.googleapis.com/maps/api/geocode/json?latlng={latitude},{longitude}&key={GOOGLE_API_KEY}")
        data = response.json()
        
        if data["status"] != "OK":
            raise requests.HTTPError
        
        if not len(data["results"]):
            raise AttributeError("No results for these coordinates.")
        
        country = None
        locality = None
        
        for result in data["results"][0]["address_components"]:
            if "country" in result["types"]:
                country: str = result["short_name"]
            
            if "locality" in result["types"]:
                locality: str = result["long_name"]
        
        if not country and not locality:
            raise AttributeError("Country and locality could not be found.")
        
        return country, locality
    
    def __init__(self, latitude: float, longitude: float, name: str | None = None):
        if abs(latitude) > 90 or abs(longitude) > 180:
            raise ValueError("Latitude and longitude must fall within +/- 90 and +/- 180 respectively.")
        
        country = None
        locality = None
        
        try:
            country, locality = self.get_location_data(latitude, longitude)
        except requests.HTTPError as error:
            print("Error retrieving Google Maps Reverse Geocoding data:", error)
        except AttributeError as error:
            print("Error retrieving country and locality:", error)
        
        super(Location, self).__init__(name = name, latitude = latitude, longitude = longitude, country = country, locality = locality)

    def __repr__(self):
        return f"<Location name = {self.name}, latitude = {self.latitude}, longitude = {self.longitude}, country = {self.country}, locality = {self.locality}>"

    def get_locations_within_radius(self, radius: float):
        """Return all locations within a given radius (in meters) of this location."""
        if radius <= 0:
            raise ValueError("Radius must be positive.")
        
        lat_min = self.latitude - radius / 111
        lat_max = self.latitude + radius / 111
        lon_min = self.longitude - radius / (111 * abs(math.cos(math.radians(self.latitude))))
        lon_max = self.longitude + radius / (111 * abs(math.cos(math.radians(self.latitude))))
        
        results = db.session.execute(
            db.select(Location)
            .filter(Location.latitude.between(lat_min, lat_max))
            .filter(Location.longitude.between(lon_min, lon_max))
        ).scalars().all()
        locations = [location for location in results if geodist((location.latitude, location.longitude), (self.latitude, self.longitude)) <= radius]

        return locations
    
    def to_dict(self):
        return {
            "name": self.name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "country": self.country,
            "locality": self.locality
        }

class Friendship(db.Model):
    __tablename__ = "friendships"
    requester_id: int = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key = True)
    receiver_id: int = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key = True)
    status: str = db.Column(db.String(20), nullable=False, default="pending")  # 'pending', 'accepted', 'declined'
    timestamp: datetime = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    requester = db.relationship("User", foreign_keys=[requester_id], backref="sent_requests")
    receiver = db.relationship("User", foreign_keys=[receiver_id], backref="received_requests")

    def __repr__(self):
        return f"<Friendship requester={self.requester_id}, receiver={self.receiver_id}, status={self.status}>"

    def to_dict(self):
        return {
            "requesterId": self.requester_id,
            "receiverId": self.receiver_id,
            "status": self.status,
            "timestamp": self.timestamp.isoformat()
        }
