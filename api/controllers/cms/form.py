from datetime import datetime, UTC


def upsert(data, post=None):
    """
    Parses and validates post form data, applies it to a Post instance.
    If post is None, creates a new Post.
    Returns (post, error_message) tuple.
    """
    from models.post import Post

    if not data or 'title' not in data or 'content' not in data:
        return None, 'Title and content are required'

    if post is None:
        post = Post(
            title=data['title'],
            content=data['content']
        )
    else:
        post.title = data['title']
        post.content = data['content']

    # set the date to now
    post.updated_at = datetime.now(UTC)

    return post, None
