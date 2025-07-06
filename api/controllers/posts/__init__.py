from flask import Blueprint

from .details import posts_details_bp
from .list import posts_list_bp
from .navigation import posts_navigation_bp

posts = Blueprint('posts', __name__)

# Register all post-related blueprints
blueprints = [
    posts_list_bp,
    # posts_create_bp,
    posts_details_bp,
    posts_navigation_bp
]


def init_posts(app):
    for blueprint in blueprints:
        app.register_blueprint(blueprint)
