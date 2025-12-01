from flask import Blueprint

posts_bp = Blueprint('posts', __name__)

from . import (get_posts, create_post, visit_post)