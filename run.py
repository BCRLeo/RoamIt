from app import create_app
import os

##UN COMMENT THE FOLLOWING LINE IF RUNNING LOCALLY

#os.environ['FLASK_ENV'] = 'development'

app = create_app()


if __name__ == '__main__':
    app.run(debug=False, port=5005)
