import os
import sys
import json

project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) 
sys.path.insert(0, project_root)

from app import create_app
from app.models import db, Post, Tag, PostTag

def load_posts_from_json(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def insert_posts(posts_data):
    app = create_app()
    with app.app_context():
        for post_info in posts_data:
            # Check if post already exists by slug
            existing_post = Post.query.filter_by(slug=post_info['slug']).first()
            if existing_post:
                print(f"Post '{post_info['slug']}' already exists. Skipping.")
                continue

            post = Post(
                title=post_info['title'],
                description=post_info['description'],
                slug=post_info['slug'],
                image_url=post_info.get('image_url'),
                url=post_info.get('url')
            )
            db.session.add(post)
            db.session.commit()

            tag_objs = []
            for tag_name in post_info.get('tags', []):
                tag = Tag.query.filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                    db.session.commit()
                tag_objs.append(tag)
                post_tag = PostTag(post_id=post.id, tag_id=tag.id)
                db.session.add(post_tag)
            db.session.commit()
            print(f"Inserted post '{post.title}' with tags {[tag.name for tag in tag_objs]}")

if __name__ == "__main__":
    json_path = os.path.join(project_root, "app", "data", "posts_info.json")
    if not os.path.exists(json_path):
        print(f"JSON file not found: {json_path}")
        sys.exit(1)
    posts_data = load_posts_from_json(json_path)
    insert_posts(posts_data)
