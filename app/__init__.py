import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from rembg import new_session
from flask_socketio import SocketIO
from .events import socketio
from .extensions import db, login_manager, migrate

def create_app():
    app = Flask(__name__, template_folder = "dist", static_folder = "dist/static", static_url_path = "/static")
    
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
    

    # Register blueprints
    from app.main import main as main_blueprint
    app.register_blueprint(main_blueprint)
    
    from app.api.auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix = "/api")
    
    from app.api.accounts import accounts as accounts_blueprint
    app.register_blueprint(accounts_blueprint, url_prefix = "/api")

    # Register socketio
    socketio.init_app(app, cors_allowed_origins="*")

    return app

