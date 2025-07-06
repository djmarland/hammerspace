from controllers.cms import init_cms
from controllers.posts import init_posts


def init_controllers(app):
    init_posts(app)
    init_cms(app)
