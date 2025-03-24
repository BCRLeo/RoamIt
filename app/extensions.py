from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate

socketio = SocketIO(cors_allowed_origins="*")
db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()