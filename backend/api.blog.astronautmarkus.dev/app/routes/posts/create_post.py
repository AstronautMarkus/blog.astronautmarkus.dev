from . import posts_bp
from flask import request, jsonify
from app.models import Post, Tag, PostTag
from app import db

@posts_bp.route('/', methods=['POST'])
def create_post():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    slug = data.get('slug')
    image_url = data.get('image_url')
    tags = data.get('tags', [])

    if not title or not description or not slug:
        return jsonify({'error': 'Missing required fields'}), 400

    # Create the post
    post = Post(
        title=title,
        description=description,
        slug=slug,
        image_url=image_url
    )
    db.session.add(post)
    db.session.commit()

    tag_objs = []
    for tag_name in tags:
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)
            db.session.commit()
        tag_objs.append(tag)
        # Link post and tag
        post_tag = PostTag(post_id=post.id, tag_id=tag.id)
        db.session.add(post_tag)
    db.session.commit()

    return jsonify({
        'id': post.id,
        'title': post.title,
        'description': post.description,
        'slug': post.slug,
        'image_url': post.image_url,
        'tags': [tag.name for tag in tag_objs]
    }), 201
