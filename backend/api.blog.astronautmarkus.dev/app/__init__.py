from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_mail import Mail
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
mail = Mail()
cors = CORS()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    cors.init_app(app)

    from app.routes.visitors import visitors_bp
    app.register_blueprint(visitors_bp, url_prefix='/visitors')

    from app.routes.posts import posts_bp
    app.register_blueprint(posts_bp, url_prefix='/posts')

    return app
