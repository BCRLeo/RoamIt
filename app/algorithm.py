from geodistpy import geodist

from .extensions import db
from .models import Listing, Location, Swipe
from .utilities import CustomHTTPError, similarity

def listing_tag_similarity(listing1_id: int, listing2_id: int):
    """Calculate asymmetric similarity of listing 1 with listing 2.

    Args:
        listing1_id (int): Reference listing ID
        listing2_id (int): Target listing ID

    Raises:
        CustomHTTPError: 404, listing not found

    Returns:
        float: Tag similarity out of 1
    """
    listing1 = db.session.get(Listing, listing1_id)
    listing2 = db.session.get(Listing, listing2_id)
    
    if not listing1 and not listing2:
        raise CustomHTTPError(f"Listings #{listing1_id} and #{listing2_id} not found.", 404)
    elif not listing1:
        raise CustomHTTPError(f"Listing #{listing1_id} not found.", 404)
    elif not listing2:
        raise CustomHTTPError(f"Listing #{listing2_id} not found.", 404)
    
    return similarity(listing1.tags, listing2.tags)

def feasible_listings_in_range(listing_id: int):
    listing: Listing = db.session.get(Listing, listing_id)
    
    if not listing:
        raise CustomHTTPError(f"Listing #{listing_id} not found.", 404)
    
    locations: list[Location] = listing.location.get_locations_within_radius(listing.radius * 1000) # convert km to m
    listings: list[Listing] = []
    
    for location in locations:
        listings += location.listings
    
    listings = list(filter(
        lambda listing_x: (
            listing_x.id != listing.id and
            geodist(
                (listing.location.latitude, listing.location.longitude),
                (listing_x.location.latitude, listing_x.location.longitude),
                "km"
            ) <= listing_x.radius and
            not listing.is_complete
        ), listings))
    
    return listings

def listings_filtered_by_swipes(by_listing_id: int, on_listing_ids: list[int]) -> list[int]:
    """Filter out swiped listings. If all listings have been swiped, return passed listings.

    Args:
        by_listing_id (int): Listing ID that made the swipe
        on_listing_ids (list[int]): Listing IDs that were swiped on

    Raises:
        CustomHTTPError: 404, Listing not found

    Returns:
        list[int]: Filtered listing IDs
    """
    for listing_id in ([by_listing_id] + on_listing_ids):
        if not db.session.get(Listing, listing_id):
            raise CustomHTTPError(f"Listing #{listing_id} not found.", 404)
        
    on_listing_ids = set(on_listing_ids)
    
    swipes: list[Swipe] | None = db.session.execute(
        db.select(Swipe)
        .filter_by(swiped_by_listing_id = by_listing_id)
        .filter(Swipe.swiped_on_listing_id.in_(on_listing_ids))
    ).scalars().all()
    
    swiped_listing_ids = {swipe.swiped_on_listing_id for swipe in swipes}
    liked_listing_ids = {swipe.swiped_on_listing_id for swipe in swipes if swipe.is_like}
    passed_listing_ids = {swipe.swiped_on_listing_id for swipe in swipes if not swipe.is_like}
    
    if on_listing_ids.issubset(liked_listing_ids): # If all listings have been liked
        return []
    
    if on_listing_ids.issubset(swiped_listing_ids): # If all listings have been swiped
        return list(on_listing_ids.intersection(passed_listing_ids)) # Return the passed listings
    
    return list(on_listing_ids.difference(swiped_listing_ids)) # Return unswiped listings

def listing_recommendations(listing_id: int):
    feasible_listings = feasible_listings_in_range(listing_id)
    
    if not feasible_listings:
        return None
    
    listing_ids: list[int] = listings_filtered_by_swipes(listing_id, [listing.id for listing in feasible_listings])
    
    if not listing_ids:
        return None
    
    tag_similarities = {id: listing_tag_similarity(listing_id, id) for id in listing_ids}
    listing_ids_sorted_by_tag_similarity = sorted(tag_similarities, key = tag_similarities.get, reverse = True)
    
    return listing_ids_sorted_by_tag_similarity