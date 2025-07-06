from flask import Blueprint, jsonify, make_response, request

from models.post import Post
from models.value_objects.results_list import ResultsList

posts_list_bp = Blueprint('posts_list', __name__)


@posts_list_bp.route('/posts', methods=['GET'])
def list_controller():
    # Get and validate parameters
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)

        if page < 1:
            return make_response(jsonify({'error': 'Page number must be a positive integer'}), 400)

        if limit > 50:
            return make_response(jsonify({'error': 'Limit cannot exceed 50'}), 400)

        query = Post.query.filter(Post.published_at.isnot(None)).order_by(Post.published_at.desc())
        paginated_posts = query.paginate(page=page, per_page=limit)

        results_list = ResultsList(
            items=[p.to_dict_summary() for p in paginated_posts.items],
            total=paginated_posts.total,
            pages=paginated_posts.pages,
            current_page=paginated_posts.page
        )

        response = make_response(jsonify(results_list.to_dict()))
        response.headers['Cache-Control'] = 'public, max-age=3600'
        return response

    except ValueError:
        return make_response(jsonify({'error': 'Invalid page or limit parameter'}), 400)
