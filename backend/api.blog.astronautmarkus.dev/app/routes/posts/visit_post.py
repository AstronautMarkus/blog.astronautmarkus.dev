from . import posts_bp
from flask import request, jsonify
from app.models import Post, PostView
from app import db
from datetime import datetime, timedelta

@posts_bp.route('/<string:slug>/visit', methods=['POST'])
def visit_post(slug):
    if not request.is_json:
        return jsonify({'error': 'Request body must be JSON.'}), 400
    data = request.json

    ip = data.get('ip')
    user_agent = data.get('user_agent', '')[:300]

    errors = {}
    if not ip:
        errors['ip'] = 'The field ip is required.'
    if errors:
        return jsonify({'errors': errors}), 422

    post = Post.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({'error': 'Post not found.'}), 404

    now = datetime.utcnow()
    last_view = PostView.query.filter_by(post_id=post.id, ip=ip).order_by(PostView.visit_time.desc()).first()
    should_register = True
    if last_view and hasattr(last_view, 'visit_time'):
        if (now - last_view.visit_time) < timedelta(hours=24):
            should_register = False

    if should_register:
        post_view = PostView(
            post_id=post.id,
            ip=ip,
            user_agent=user_agent
        )
        db.session.add(post_view)
        db.session.commit()
        return jsonify({
            'message': 'Post view registered successfully.',
            'post_view': post_view.to_dict()
        }), 201
    else:
        return jsonify({
            'message': 'Post view not registered: less than 24 hours since last view from this IP.'
        }), 200