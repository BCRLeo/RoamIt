from flask import Blueprint, render_template

main = Blueprint('main', __name__)
#redirect users trying to get to unaccessible pages

# Catch-all route to serve index.html for any other route
@main.route('/', defaults={'path': ''})
@main.route('/<path:path>')
def serve_react_app(path):
    return render_template("index.html")