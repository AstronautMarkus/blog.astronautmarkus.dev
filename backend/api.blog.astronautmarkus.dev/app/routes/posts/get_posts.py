from . import posts_bp
from flask import jsonify
from app.models import Post, PostTag, Tag

@posts_bp.route('/', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    posts_data = []
    for post in posts:
        post_tags = PostTag.query.filter_by(post_id=post.id).all()
        tag_ids = [pt.tag_id for pt in post_tags]
        tags = Tag.query.filter(Tag.id.in_(tag_ids)).all()
        tags_names = [tag.name for tag in tags]
        posts_data.append({
            'id': post.id,
            'title': post.title,
            'description': post.description,
            'image_url': post.image_url,
            'slug': post.slug,
            'tags': tags_names
        })
    return jsonify(posts_data)

@posts_bp.route('/<string:slug>', methods=['GET'])
def get_post_by_slug(slug):
    post = Post.query.filter_by(slug=slug).first()

    if not post:
        return jsonify({'error': 'Post not found'}), 404

    post_id = post.id
    post_tags = PostTag.query.filter_by(post_id=post_id).all()
    tag_ids = [pt.tag_id for pt in post_tags]
    tags = Tag.query.filter(Tag.id.in_(tag_ids)).all()
    tags_names = [tag.name for tag in tags]

    post_data = {
        'id': post.id,
        'title': post.title,
        'description': post.description,
        'image_url': post.image_url,
        'slug': post.slug,
        'tags': tags_names
    }
    return jsonify(post_data)