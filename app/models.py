from . import db
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import text

# Association table for destination tags
destination_tags = db.Table(
    'destination_tags',
    db.Column('destination_id', db.Integer, db.ForeignKey('destinations.id'), primary_key=True),
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

class Swipe(db.Model):
    __tablename__ = 'swipes'
    id = db.Column(db.Integer, primary_key=True)
    swiped_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    swiped_on_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    destination_id = db.Column(db.Integer, db.ForeignKey('destinations.id'), nullable=False)
    # True for right swipe (accept), False for left swipe (reject)
    is_right_swipe = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    swiped_by = db.relationship('User', foreign_keys=[swiped_by_id], back_populates='swipes_made')
    swiped_on = db.relationship('User', foreign_keys=[swiped_on_id], back_populates='swipes_received')
    destination = db.relationship('Destination', back_populates='swipes')

class Destination(db.Model):
    __tablename__ = 'destinations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    destination_type = db.Column(db.String(20), nullable=False)  # 'short', 'long', or 'hosting'
    country = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    dates_are_approximate = db.Column(db.Boolean, default=True)
    budget_per_night = db.Column(db.Float, nullable=True)
    currency = db.Column(db.String(10), nullable=True)
    description = db.Column(db.Text, nullable=True)
    # Indicates if only users of the same gender should be considered
    same_gender_preference = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

    # Relationships
    creator = db.relationship('User', back_populates='destinations')
    tags = db.relationship('Tag', secondary=destination_tags, back_populates='destinations')
    swipes = db.relationship('Swipe', back_populates='destination', lazy='dynamic')

class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    # Relationships for both destinations and users
    destinations = db.relationship('Destination', secondary=destination_tags, back_populates='tags')
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
    destinations = db.relationship('Destination', back_populates='creator', lazy='dynamic')
    profile_pictures = db.relationship('ProfilePicture', back_populates='user', lazy='dynamic')
    tags = db.relationship('Tag', secondary=user_tags, back_populates='users')
    swipes_made = db.relationship('Swipe', foreign_keys='Swipe.swiped_by_id', back_populates='swiped_by', lazy='dynamic')
    swipes_received = db.relationship('Swipe', foreign_keys='Swipe.swiped_on_id', back_populates='swiped_on', lazy='dynamic')
    # Users that this user has blocked; the blocked users will also have a 'blocked_by' attribute via backref
    blocked_users = db.relationship(
        'User',
        secondary=blocks,
        primaryjoin=(blocks.c.blocker_id == id),
        secondaryjoin=(blocks.c.blocked_id == id),
        backref='blocked_by',
        lazy='dynamic'
    )
