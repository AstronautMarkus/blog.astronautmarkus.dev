from . import visitors_bp
from flask import jsonify
from app.models import Visitor

@visitors_bp.route('/', methods=['GET'], strict_slashes=False)
def get_visitors():
    visitors = Visitor.query.order_by(Visitor.visit_time.desc()).all()
    visitors_counter = len(visitors)
    last_visitor = None
    if visitors:
        last = visitors[0]
        last_visitor = {
            'ip_address': last.ip_address,
            'country': last.country,
            'country_code': last.country_code,
            'visit_time': last.visit_time.isoformat(),
        }
        countries = [{'country': visitor.country, 'country_code': visitor.country_code} for visitor in visitors]

    return jsonify({
        'visitors_counter': visitors_counter,
        'last_visitor': last_visitor,
        'countries': countries if visitors else [],
    })