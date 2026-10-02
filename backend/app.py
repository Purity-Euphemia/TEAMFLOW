import os
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import re

app = Flask(__name__)
# Enable CORS for the Vite dev server, allowing credentials (cookies)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

app.config['SECRET_KEY'] = 'dev_secret_key_teamflow_2026'
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'teamflow.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Secure cookie configuration
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
# Set to False for local dev without HTTPS, otherwise True
app.config['SESSION_COOKIE_SECURE'] = False 

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

with app.app_context():
    db.create_all()

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    full_name = data.get('fullName', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Validation
    if not full_name:
        return jsonify({"error": "Please enter your full name."}), 400
    if not email:
        return jsonify({"error": "Please enter your email address."}), 400
    if not password:
        return jsonify({"error": "Please enter a password."}), 400
    if len(full_name) > 100:
        return jsonify({"error": "Full name is too long."}), 400
    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long."}), 400

    # Check duplicate
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email address already in use."}), 409

    # Create user
    hashed_password = generate_password_hash(password)
    new_user = User(full_name=full_name, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Account created successfully."}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Please enter your email and password."}), 400

    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        # Generic error message to prevent email enumeration
        return jsonify({"error": "Invalid email or password."}), 401

    # Establish secure session
    session.clear()
    session['user_id'] = user.id

    return jsonify({"message": "Login successful", "user": {"id": user.id, "full_name": user.full_name, "email": user.email}}), 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({"error": "Unauthorized"}), 401

    return jsonify({"user": {"id": user.id, "full_name": user.full_name, "email": user.email}}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
