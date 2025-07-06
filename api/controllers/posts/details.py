from flask import Blueprint, jsonify, make_response

from models.post import Post

posts_details_bp = Blueprint('details', __name__)


@posts_details_bp.route('/posts/<string:url_key>', methods=['GET'])
def details(url_key):
    post = Post.query.filter_by(url_key=url_key).first_or_404()
    response = make_response(jsonify(post.to_dict()))
    response.headers['Cache-Control'] = 'public, max-age=3600'
    return response
