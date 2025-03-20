from app import create_app, db
import os
##UN COMMENT THE FOLLOWING LINE IF RUNNING LOCALLY

#os.environ['FLASK_ENV'] = 'development'

app = create_app()
with app.app_context():
    db.create_all()
