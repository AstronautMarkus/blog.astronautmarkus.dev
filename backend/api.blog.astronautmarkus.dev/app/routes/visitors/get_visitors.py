from . import visitors_bp
from flask import jsonify
from app.models import Visitor

@visitors_bp.route('/', methods=['GET'])
def get_visitors():
    visitors = Visitor.query.order_by(Visitor.visit_time.desc()).all()
    visitors_counter = len(visitors)
    last_visitor = None
    if visitors:
        last = visitors[0]
        last_visitor = {
            'ip_address': last.ip_address,
            'country': last.country,
            'visit_time': last.visit_time.isoformat(),
        }
        countries = [visitor.country for visitor in visitors]

    return jsonify({
        'visitors_counter': visitors_counter,
        'last_visitor': last_visitor,
        'countries': countries,
    })