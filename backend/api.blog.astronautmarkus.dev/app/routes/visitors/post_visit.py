from . import visitors_bp
from flask import request, jsonify
from app import db
from app.models import Visitor
from datetime import datetime, timedelta
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

@visitors_bp.route('/', methods=['POST'])
def post_visit():
    if not request.is_json:
        return jsonify({'error': 'Request body must be JSON.'}), 400
    data = request.json
    required_fields = ['ip_address']
    errors = {}
    for field in required_fields:
        if field not in data or not data[field]:
            errors[field] = f'The field {field} is required.'
    if errors:
        return jsonify({'errors': errors}), 422

    country = data.get('country')
    if country:
        country = slugify(country)

    country_code = data.get('country_code')
    if country_code:
        country_code = country_code.upper()

    user_agent = data.get('user_agent')
    if user_agent:
        user_agent = user_agent[:300]

    # Check for previous visit from the same IP
    ip_address = data['ip_address']
    last_visit = Visitor.query.filter_by(ip_address=ip_address).order_by(Visitor.visit_time.desc()).first()
    now = datetime.utcnow()
    should_register = True
    if last_visit:
        if (now - last_visit.visit_time) < timedelta(hours=24):
            should_register = False

    if should_register:
        new_visitor = Visitor(
            ip_address=ip_address,
            country=country,
            country_code=country_code,
            visit_time=now,
            user_agent=user_agent
        )
        db.session.add(new_visitor)
        db.session.commit()

    visitors = Visitor.query.order_by(Visitor.visit_time.desc()).all()
    visitors_counter = len(visitors)
    last_visitor = None
    if visitors:
        last = visitors[0]
        last_visitor = {
            'ip_address': last.ip_address,
            'country': last.country,
            'country_code': last.country_code,
            'visit_time': last.visit_time.isoformat()
        }
    if should_register:

        return jsonify({
            'message': 'Visitor registered successfully.',
            'visitors_counter': visitors_counter,
            'last_visitor': last_visitor
        }), 201
    
    else:
        return jsonify({
            'message': 'Visit not registered: less than 24 hours since last visit from this IP.'
        }), 200