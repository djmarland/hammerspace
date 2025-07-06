from flask import Blueprint, jsonify, request

from models import db
from .form import upsert

cms_create_post_bp = Blueprint('cms_create_post', __name__)


@cms_create_post_bp.route('/cms/create', methods=['POST'])
def create_post():
    data = request.get_json()
    post, error = upsert(data)
    if error:
        return jsonify({'error': error}), 400
    try:
        db.session.add(post)
        db.session.commit()
        return jsonify({'message': 'Post created successfully', 'id': post.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
