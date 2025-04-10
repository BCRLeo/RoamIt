from flask import Blueprint, jsonify, request
from geodistpy import geodist
import math
from ..models import db, Location

maps = Blueprint("maps", __name__)

def create_location(latitude: float, longitude: float, name: str | None = None):
    if db.session.execute(
        db.select(Location)
        .filter_by(name = name)
        .filter_by(latitude = latitude)
        .filter_by(longitude = longitude)
    ).scalars().first():
        return
    
    location = Location(latitude, longitude, name)
    
    try:
        db.session.add(location)
        db.session.commit()
    except Exception as error:
        print("Error creating location:", error)
        db.session.rollback()

def get_location_at_coordinate(latitude: float, longitude: float) -> Location | None:
    if abs(latitude) > 90 or abs(longitude) > 180:
        raise ValueError("Latitude and longitude must fall in [-90, 90] and [-180, 180] respectively.")
    
    locations = db.session.execute(
        db.select(Location)
        .filter_by(latitude = latitude)
        .filter_by(longitude = longitude)
    ).scalars().all()
    
    return [location for location in locations]

def get_locations_within_radius(latitude: float, longitude: float, radius: float, page: int = 1) -> list[Location] | None:
    """Get all locations within a certain radius (in metres) of a point."""
    if radius < 0:
        raise ValueError("Radius must be positive.")
    
    if radius == 0:
        return get_location_at_coordinate(latitude, longitude)
    
    lat_min = latitude - radius / 111
    lat_max = latitude + radius / 111
    lon_min = longitude - radius / (111 * abs(math.cos(math.radians(latitude))))
    lon_max = longitude + radius / (111 * abs(math.cos(math.radians(latitude))))
    
    results = db.session.execute(
        db.select(Location)
        .filter(Location.latitude.between(lat_min, lat_max))
        .filter(Location.longitude.between(lon_min, lon_max))
    ).scalars().all()
    nearby = [location for location in results if geodist((location.latitude, location.longitude), (latitude, longitude)) <= radius]
    
    page_size = 20
    start = (page - 1) * page_size
    end = start + page_size
    locations = nearby[start:end]
    
    return [location for location in locations]

def get_location_ids_within_radius(latitude: float, longitude: float, radius: float, page: int = 1) -> list[int] | None:
    """Get the IDs of all locations within a certain radius (in metres) of a point."""
    
    locations = get_locations_within_radius(latitude, longitude, radius, page)
    location_ids = [location.id for location in locations] if not isinstance(locations, Location) else [locations.id]
    
    return location_ids

@maps.route("/maps/locations")
def get_locations():
    coordinates = request.args.get("latlng")
    latitude: float | None = None
    longitude: float | None = None
    
    if coordinates:
        latitude, longitude = coordinates.split(",")
    
        try:
            latitude = float(latitude)
            longitude = float(longitude)
            
            if abs(latitude) > 90 or abs(longitude) > 180:
                raise ValueError
        except TypeError or ValueError:
            return jsonify({"error": "Invalid coordinates."}), 400
    
    radius = request.args.get("radius")
    radius = float(radius) if radius else 0
    
    page = request.args.get("page")
    page = int(page) if page else 1
    
    if page < 0:
        return jsonify({"error": "Page number must be postive."}), 400
    
    if latitude is not None and longitude is not None:
        locations = get_locations_within_radius(latitude, longitude, radius, page)
    else:
        locations = db.paginate(db.select(Location), page = page)
        
    location_data = [location.to_dict() for location in locations] if not isinstance(locations, Location) else locations.to_dict()
        
    return jsonify({"data": location_data})