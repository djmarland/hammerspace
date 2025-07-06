from flask import Blueprint, jsonify, make_response
from sqlalchemy import and_

from models.post import Post

posts_navigation_bp = Blueprint('navigation', __name__)


@posts_navigation_bp.route('/posts/<string:url_key>/navigation', methods=['GET'])
def navigation(url_key):
    post = Post.query.filter_by(url_key=url_key).first_or_404()

    next_post = Post.query.filter(
        and_(
            Post.published_at.isnot(None),
            Post.published_at > post.published_at
        )
    ).order_by(Post.published_at.asc()).first()

    prev_post = Post.query.filter(
        and_(
            Post.published_at.isnot(None),
            Post.published_at < post.published_at
        )
    ).order_by(Post.published_at.desc()).first()

    response = make_response(jsonify({
        'next': next_post.to_dict_summary() if next_post else None,
        'previous': prev_post.to_dict_summary() if prev_post else None
    }))
    response.headers['Cache-Control'] = 'public, max-age=3600'
    return response
