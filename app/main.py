from flask import Flask, Blueprint, current_app, render_template, redirect, request, url_for, jsonify, send_file
from flask_login import LoginManager, login_required, current_user
import io
import os
import app
from .models import User, Like, Post
from . import ImageBackgroundRemoverV1
from . import db
from . import models
from werkzeug.utils import secure_filename
from json import dumps
from .algorithm import get_posts

main = Blueprint('main', __name__)
#redirect users trying to get to unaccessible pages
login_manager = LoginManager()
login_manager.login_view = 'auth.login'

# Get the correct JS and CSS file paths
def get_js_and_css():
    js_dir = os.path.join(main.root_path, 'static', 'js')
    css_dir = os.path.join(main.root_path, 'static', 'css')

    js_file = next((f for f in os.listdir(js_dir) if f.endswith('.js')), None)
    css_file = next((f for f in os.listdir(css_dir) if f.endswith('.css')), None)

    return {
        'js': js_file if js_file else 'main.js',  # Default fallback
        'css': css_file if css_file else 'main.css',  # Default fallback
    }

# Register the function globally in all templates
@main.context_processor
def inject_js_and_css():
    return dict(get_js_and_css=get_js_and_css)

# Catch-all route to serve index.html for any other route
@main.route('/', defaults={'path': ''})
@main.route('/<path:path>')
def serve_react_app(path):
    return render_template("index.html")

"""
API ROUTES
profile
"/api/profile/<username>", methods=["GET"]
'/api/profile/<username>/picture', methods=['POST']
'/api/profile/<username>/picture', methods=['POST']

wardrobe
"/api/wardrobe/items", methods=["POST"]
'/api/wardrobe/items/<item_type>', methods=['GET']
"/api/wardrobe/items/<item_type>", methods=["DELETE"]
"/api/wardrobe/outfits", methods = ["POST"]
"/api/wardrobe/outfits", methods=["GET"]
"/api/wardrobe/outfits/<param>", methods=["GET"]

feed
"/api/posts/<param>", methods=["GET"]
"/api/posts/<param>/author", methods=["GET"]
"/api/feed", methods=["GET"]
'/api/posts/<int:post_id>/likes', methods=['GET']
"/api/posts/<int:post_id>/liked", methods=["GET"]
"/api/posts/<int:post_id>/likes", methods=["PUT"]
"/api/posts/<int:post_id>/likes", methods=["DELETE"]
"""


""" @main.route("/api/wardrobe/items", methods=["POST"])
def upload_wardrobe_item():
    if not current_user.is_authenticated:
        return jsonify({"success": False, "message": "User not logged in"}), 401

    wardrobe = current_user.wardrobe 
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file part"}), 400

    file = request.files['file']
    if not file:
        return jsonify({"success": False, "message": "File could not be uploaded"}), 400
    
    if file.filename == "":
        return jsonify({"success": False, "message": "No selected file"}), 400

    if "category" not in request.form:
        return jsonify({"success": False, "message": "No category part"}), 400
    
    category = request.form["category"]
    if not category:
        return jsonify({"success": False, "message": "File could not be uploaded"}), 400

    if category == "":
        return jsonify({"success": False, "message": "No selected category"}), 400
    
    # Secure the filename (though not strictly necessary since we're storing in DB)
    filename = secure_filename(file.filename)
                
    # Create a new Jacket instance associated with the user's wardrobe
    new_clothing = ""
    match category:
        case "jacket":
            new_clothing = models.Jacket(wardrobe_id=wardrobe.id)
        case "shirt":
            new_clothing = models.Shirt(wardrobe_id=wardrobe.id)
        case "trouser":
            new_clothing = models.Trouser(wardrobe_id=wardrobe.id)
        case "shoe":
            new_clothing = models.Shoe(wardrobe_id=wardrobe.id)
        case _:
            return jsonify({"success": False, "message": "Invalid clothing category"}), 400
    
        
    # Read the image data and get the MIME type
    file_data = file.read()
    file_data = ImageBackgroundRemoverV1.remove_background_file(file_data)
    mimetype = file.mimetype

    if not mimetype.startswith('image/'):
        return jsonify({"success": False, "message": "Uploaded file is not an image"}), 400

    # Assign the image data and MIME type to the new jacket
    new_clothing.image_data = file_data
    new_clothing.image_mimetype = mimetype

     # Add and commit the new jacket to the database
    db.session.add(new_clothing)
    db.session.commit()
        
    return jsonify({"success": True, "message": "File successfully uploaded"}), 200

@main.route('/api/wardrobe/items/<item_type>', methods=['GET'])
def get_wardrobe_images(item_type):
    user_id = request.args.get("user-id")
    if user_id:
        user_id = int(user_id)
        

    if not current_user.is_authenticated:
        return jsonify({"success": False, "message": "User not logged in"}), 401

    items = None
    match item_type:
        case "jacket":
            items = current_user.wardrobe.jackets
        case "shirt":
            items = current_user.wardrobe.shirts
        case "trousers":
            items = current_user.wardrobe.trousers
        case "shoes":
            items = current_user.wardrobe.shoes
        case _:
            return jsonify({"success": False, "message": "Invalid item type"}), 400

    images = [item.image_data for item in items]
    ids = [item.id for item in items]

    id = request.args.get("id")
    if id:
        id = int(id)
        if id not in ids:
            return jsonify({"success": False, "message": "Invalid image ID"}), 404
        
        index = ids.index(id)
        mimetypes = [item.image_mimetype for item in items]
        image_bytes = images[index]
        image_io = io.BytesIO(image_bytes)
        return send_file(image_io, mimetype = mimetypes[index])

    image_metadata = [
        {"id": idx, "url": f"/api/wardrobe/items/{item_type}?id={idx}"}
        for idx in ids
    ]
    return jsonify(image_metadata)

@main.route("/api/wardrobe/items/<item_type>", methods=["DELETE"])
def delete_wardrobe_item(item_type):
    if not current_user.is_authenticated:
        return jsonify({"success": False, "message": "User not logged in"}), 401
    
    items = None
    match item_type:
        case "jacket":
            items = current_user.wardrobe.jackets
        case "shirt":
            items = current_user.wardrobe.shirts
        case "trousers":
            items = current_user.wardrobe.trousers
        case "shoes":
            items = current_user.wardrobe.shoes
        case _:
            return jsonify({"success": False, "message": "Invalid item type"}), 400
        
    id = request.args.get("id")
    if not id:
        return jsonify({"success": False, "message": "No item ID provided"}), 400
    id = int(id)

    ids = [item.id for item in items]

    if id not in ids:
            return jsonify({"success": False, "message": "Invalid item ID"}), 404
    
    for element in items:
        if element.id != id:
            continue
        if element.wardrobe.user_id == current_user.id:
            db.session.delete(element)
            db.session.commit()
            return jsonify({"success": True, "message": f"{item_type.capitalize()} deleted successfully"}), 200
    
    return jsonify({"success": False, "message": "You do not have permission to delete this item"}), 403 """


@main.route("/api/posts", methods=["POST"])
def upload_feed_post():
    if not current_user.is_authenticated:
        return jsonify({"success": False, "message": "User not logged in"}), 401
    
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file uploaded"}), 400

    file = request.files["file"]
    if not file:
        return jsonify({"success": False, "message": "File could not be uploaded"}), 400
    
    if file.filename == "":
        return jsonify({"success": False, "message": "No selected file"}), 400
    
    # Secure the filename (though not strictly necessary since we're storing in DB)
    filename = secure_filename(file.filename)
    
    posts = current_user.posts
    new_post = models.Post()
        
    # Read the image data and get the MIME type
    file_data = file.read()
    mimetype = file.mimetype

    if not mimetype.startswith('image/'):
        return jsonify({"success": False, "message": "Uploaded file is not an image"}), 400

    # Assign the image data and MIME type to the new jacket
    new_post.user_id = current_user.id
    new_post.image_data = file_data
    new_post.image_mimetype = mimetype

     # Add and commit the new jacket to the database
    db.session.add(new_post)
    db.session.commit()
        
    return jsonify({"success": True, "message": "File successfully uploaded"}), 200

@main.route("/api/search", methods=["POST"])
def search_users():

    data = request.get_json()
    query = data.get("query").strip()

    if len(query) < 2:
            return jsonify({"success" : False, "message" : "Query must be at least 2 characters long."})

    results = User.query.filter(
            (User.UserName.ilike(f"%{query}%"))   # Search by username
        ).all()

    if not results:
        return jsonify({"success" : False, "message" : "No user found"})
    
    userNames = [user.UserName for user in results]

    return jsonify({"success" : True, "message" : "Search was successful", "userNames" : userNames})
    
##this is just a quick function to return the favorited items, chnage it as you need
# @app.route('/wardrobe/favorites')
# def favorite_items():
#     favorite_jackets = current_user.wardrobe.get_favorite_jackets()
#     favorite_shirts = current_user.wardrobe.get_favorite_shirts()
#     favorite_trousers = current_user.wardrobe.get_favorite_trousers()
#     favorite_shoes = current_user.wardrobe.get_favorite_shoes()
#     favorite_outfits = current_user.get_favorite_outfits()
#     return render_template('favorites.html', jackets=favorite_jackets, shirts=favorite_shirts,
#                            trousers=favorite_trousers, shoes=favorite_shoes, outfits=favorite_outfits)
