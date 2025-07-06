from flask import Flask


def init_controllers(app: Flask):
    from controllers.cms import init_cms
    from controllers.posts import init_posts

    init_cms(app)
    init_posts(app)

    return app
