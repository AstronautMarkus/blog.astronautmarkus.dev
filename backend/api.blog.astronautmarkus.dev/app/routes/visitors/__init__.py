from flask import Blueprint

visitors_bp = Blueprint('visitors', __name__)

from . import (get_visitors, post_visit)