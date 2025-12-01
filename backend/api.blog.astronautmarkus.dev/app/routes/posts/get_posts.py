from . import posts_bp
from flask import jsonify
from app.models import Post, PostTag, Tag

@posts_bp.route('/', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    posts_data = [
        {
            'id': post.id,
            'title': post.title,
            'description': post.description,
            'image_url': post.image_url,
            'slug': post.slug
        }
        for post in posts
    ]
    return jsonify(posts_data)

@posts_bp.route('/<string:slug>', methods=['GET'])
def get_post_by_slug(slug):
    post = Post.query.filter_by(slug=slug).first()

    if not post:
        return jsonify({'error': 'Post not found'}), 404

    post_data = {
        'id': post.id,
        'title': post.title,
        'description': post.description,
        'image_url': post.image_url,
        'slug': post.slug
    }
    return jsonify(post_data)