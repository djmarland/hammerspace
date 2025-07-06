from datetime import datetime

from flask import Blueprint, jsonify, request
from sqlalchemy.orm.exc import NoResultFound

from models import db
from models.post import Post

cms_publish_bp = Blueprint('cms_publish', __name__)


@cms_publish_bp.route('/cms/posts/<int:post_id>/publish', methods=['POST'])
def publish_post(post_id):
    try:
        post = Post.query.filter_by(id=post_id).one()
        data = request.get_json()

        if 'publishDate' not in data:
            return jsonify({"error": "Published date is required"}), 400

        published_at = datetime.fromisoformat(data['publishDate'])

        # Set the URL on first publish
        if post.published_at is None:
            post.url_key = f"{data['urlKey'].strip('-')}-{published_at.strftime('%m-%Y')}"

        post.published_at = published_at

        db.session.commit()
        return jsonify(post.to_dict())
    except NoResultFound:
        return jsonify({"error": "Post not found"}), 404
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
