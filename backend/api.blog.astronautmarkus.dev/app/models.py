from . import db
from datetime import datetime

class Visitor(db.Model):
    __tablename__ = 'visitors'

    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), nullable=False)
    country = db.Column(db.String(100), nullable=True)
    country_code = db.Column(db.String(10), nullable=True)
    visit_time = db.Column(db.DateTime, default=datetime.utcnow)
    user_agent = db.Column(db.String(300), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'ip_address': self.ip_address,
            'country': self.country,
            'country_code': self.country_code,
            'visit_time': self.visit_time.isoformat(),
            'user_agent': self.user_agent
        }

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(300), nullable=True)
    slug = db.Column(db.String(200), unique=True, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug
        }

class PostView(db.Model):
    __tablename__ = 'post_views'

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    ip = db.Column(db.String(50))
    user_agent = db.Column(db.String(300))

    def to_dict(self):
        return {
            'id': self.id,
            'post_id': self.post_id,
            'timestamp': self.timestamp.isoformat(),
            'ip': self.ip,
            'user_agent': self.user_agent
        }
    
class Tag(db.Model):
    __tablename__ = 'tags'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }
    
class PostTag(db.Model):
    __tablename__ = 'post_tags'

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'post_id': self.post_id,
            'tag_id': self.tag_id
        }