from flask import Blueprint, jsonify, request

from models.post import Post
from models.value_objects.results_list import ResultsList

cms_posts_bp = Blueprint('cms_posts', __name__)


@cms_posts_bp.route('/cms/posts', methods=['GET'])
def posts_controller():
    page = request.args.get('page', 1, type=int)
    per_page = 30
    paginated_posts = Post.query.order_by(Post.updated_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    results_list = ResultsList(
        items=[p.to_dict_summary() for p in paginated_posts.items],
        total=paginated_posts.total,
        pages=paginated_posts.pages,
        current_page=paginated_posts.page
    )

    return jsonify(results_list.to_dict())
