from flask import Blueprint

cms = Blueprint('cms', __name__)


def init_cms(app):
    # Import blueprints here to avoid circular imports
    from .create import cms_create_post_bp
    from .posts import cms_posts_bp
    from .edit import cms_edit_bp

    # Register blueprints
    app.register_blueprint(cms_create_post_bp)
    app.register_blueprint(cms_posts_bp)
    app.register_blueprint(cms_edit_bp)
    app.register_blueprint(cms)
