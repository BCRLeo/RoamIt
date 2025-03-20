import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from rembg import new_session

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Load configuration
    env = os.environ.get('FLASK_ENV', 'production')
    if env == 'development':
        app.config.from_object('config.DevelopmentConfig')
    elif env == 'testing':
        app.config.from_object('config.TestingConfig')
    else:
        app.config.from_object('config.ProductionConfig')

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    # Import models
    from .models import User

    # User loader callback
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    app.rembg_session = new_session('u2net')

    # Register blueprints


    return app

