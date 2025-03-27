from .extensions import db
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import text

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
discussion_members = db.Table('discussion_members',
    db.Column('discussion_id', db.Integer, db.ForeignKey('discussions.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)


class Swipe(db.Model):
    __tablename__ = 'swipes'
    id = db.Column(db.Integer, primary_key=True)
    swiped_by_listing_id = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
    swiped_on_listing_id = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
    is_right_swipe = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

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
    id = db.Column(db.Integer, primary_key=True)
    listing1_id = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
    listing2_id = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
    matched_on = db.Column(db.DateTime, default=datetime.utcnow)

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
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    listing_type = db.Column(db.String(20), nullable=False)  # 'short', 'long', or 'hosting'
    country = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    dates_are_approximate = db.Column(db.Boolean, default=True)
    budget_per_night = db.Column(db.Float, nullable=True)
    currency = db.Column(db.String(10), nullable=True)
    description = db.Column(db.Text, nullable=True)
    trip_completed = db.Column(db.Boolean, nullable = False, default = False)
    # Indicates if only users of the same gender should be considered
    same_gender_preference = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

    # Relationships
    creator = db.relationship('User', back_populates='listings')
    tags = db.relationship('Tag', secondary=listing_tags, back_populates='listings')

class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    # Relationships for both listings and users
    listings = db.relationship('Listing', secondary=listing_tags, back_populates='tags')
    users = db.relationship('User', secondary=user_tags, back_populates='tags')

class ProfilePicture(db.Model):
    __tablename__ = 'profile_pictures'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    image_data = db.Column(db.LargeBinary, nullable=False)
    image_mimetype = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship back to the user
    user = db.relationship('User', back_populates='profile_pictures')

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    username = db.Column(db.String(150), unique=True, nullable=False)
    first_name = db.Column(db.String(150), nullable = False)
    last_name = db.Column(db.String(150), nullable = False)
    birthday = db.Column(db.Date, nullable=False)
    creation_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    phone_number = db.Column(db.String(20), nullable=True, unique=True)
    description = db.Column(db.String(500), nullable=True)
    gender = db.Column(db.String(20), nullable=False)  # User's gender

    premium = db.Column(db.Boolean, nullable=False, default=False, server_default=text('false'))
    is_public = db.Column(db.Boolean, nullable=False, default=False, server_default=text('false'))

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

    # Users that this user has blocked; the blocked users will also have a 'blocked_by' attribute via backref
    blocked_users = db.relationship(
        'User',
        secondary=blocks,
        primaryjoin=(blocks.c.blocker_id == id),
        secondaryjoin=(blocks.c.blocked_id == id),
        backref='blocked_by',
        lazy='dynamic'
    )



class Discussion(db.Model):
    __tablename__ = 'discussions'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    members = db.relationship('User', secondary=discussion_members,
                              backref=db.backref('discussions', lazy='dynamic'))
    
    messages = db.relationship('Message', backref='discussion', lazy='dynamic')

class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    discussion_id = db.Column(db.Integer, db.ForeignKey('discussions.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    file_url = db.Column(db.String(255), nullable=True) 
    seen = db.Column(db.Boolean, nullable = False, default = False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship('User', foreign_keys=[sender_id])  
    #conversaion = db.relationship('User', foreign_keys=[discussion_id])
    # Not deleting this line, as it was added (when we called discussion conversasions) to link chats to certain listings
    # I'm not sure if we want the chats to be independant of listings or not so leaving this here for future me 
    reactions = db.relationship('Reaction', backref='message', lazy='dynamic')

    def to_dict(self):
        """
        IMO self explanatory but jsut returns info aboit the message, but not the reactions
        """
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "discussion_id": self.discussion_id,
            "content": self.content,
            "file_url": self.file_url,
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
    id = db.Column(db.Integer, primary_key=True)
    message_id = db.Column(db.Integer, db.ForeignKey('messages.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reaction_type = db.Column(db.String(20), nullable=False)  
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """
        Implement tmr I'm dead rn
        """

class Rating(db.Model):
    __tablename__ = 'ratings'
    id = db.Column(db.Integer, primary_key = True)
    listing_id = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
    rater_id = db.Column(db.Integer, db.ForeignKey('listings.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)

    listing = db.relationship('Listing', foreign_keys=[listing_id])
    rater = db.relationship('Listing', foreign_keys=[rater_id])


    @classmethod
    def rate(cls, listing, rater, rating):
        new_rating = cls(
            listing_id = listing.id,
            rater_id = rater.id,
            rating = rating
        )
        db.session.add(new_rating)
        db.session.commit()
