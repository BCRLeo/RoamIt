from app import create_app, socketio
import os

##UN COMMENT THE FOLLOWING LINE IF RUNNING LOCALLY

os.environ['FLASK_ENV'] = 'development'
#######

app = create_app()


if __name__ == '__main__':
    socketio.run(app, debug=True, port=5005)