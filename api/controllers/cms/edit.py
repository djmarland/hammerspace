from flask import Blueprint, jsonify, request
from sqlalchemy.orm.exc import NoResultFound

from models import db
from models.post import Post
from .form import upsert

cms_edit_bp = Blueprint('cms_edit', __name__)


@cms_edit_bp.route('/cms/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    try:
        post = Post.query.filter_by(id=post_id).one()
        return jsonify(post.to_dict())
    except NoResultFound:
        return jsonify({"error": "Post not found"}), 404


@cms_edit_bp.route('/cms/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    try:
        post = Post.query.filter_by(id=post_id).one()
        data = request.get_json()
        post, error = upsert(data, post)
        if error:
            return jsonify({'error': error}), 400
        db.session.commit()
        return jsonify(post.to_dict())
    except NoResultFound:
        return jsonify({"error": "Post not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400
