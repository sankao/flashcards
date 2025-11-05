from flask import Flask, request, jsonify, session, render_template, send_from_directory
import sqlite3
import hashlib
import secrets
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)  # Generate a random secret key

DATABASE = 'flashcards.db'

def get_db():
    """Create a database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with tables"""
    conn = get_db()
    cursor = conn.cursor()

    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create flashcards table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            character TEXT NOT NULL,
            pinyin TEXT,
            zhuyin TEXT,
            meaning TEXT NOT NULL,
            level INTEGER DEFAULT 0,
            last_review TIMESTAMP,
            next_review TIMESTAMP NOT NULL,
            correct_count INTEGER DEFAULT 0,
            incorrect_count INTEGER DEFAULT 0,
            streak INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()
    conn.close()

def hash_password(password):
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

# Initialize database on startup
init_db()

# Serve static files
@app.route('/')
def index():
    if 'user_id' not in session:
        return send_from_directory('.', 'login.html')
    return send_from_directory('.', 'chinese_review.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# Authentication endpoints
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    password = data.get('password')

    if not name or not password:
        return jsonify({'error': 'Nom et mot de passe requis'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check if user already exists
    cursor.execute('SELECT id FROM users WHERE name = ?', (name,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Ce nom d\'utilisateur existe déjà'}), 400

    # Create user
    password_hash = hash_password(password)
    cursor.execute('INSERT INTO users (name, password_hash) VALUES (?, ?)',
                   (name, password_hash))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    # Log user in
    session['user_id'] = user_id
    session['user_name'] = name

    return jsonify({'success': True, 'user_name': name})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    name = data.get('name')
    password = data.get('password')

    if not name or not password:
        return jsonify({'error': 'Nom et mot de passe requis'}), 400

    conn = get_db()
    cursor = conn.cursor()

    password_hash = hash_password(password)
    cursor.execute('SELECT id, name FROM users WHERE name = ? AND password_hash = ?',
                   (name, password_hash))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({'error': 'Nom d\'utilisateur ou mot de passe incorrect'}), 401

    session['user_id'] = user['id']
    session['user_name'] = user['name']

    return jsonify({'success': True, 'user_name': user['name']})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({'authenticated': True, 'user_name': session.get('user_name')})
    return jsonify({'authenticated': False})

# Flashcard endpoints
@app.route('/api/flashcards', methods=['GET'])
def get_flashcards():
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, character, pinyin, zhuyin, meaning, level, last_review, next_review,
               correct_count, incorrect_count, streak
        FROM flashcards
        WHERE user_id = ?
    ''', (session['user_id'],))

    flashcards = []
    for row in cursor.fetchall():
        flashcards.append({
            'id': row['id'],
            'character': row['character'],
            'pinyin': row['pinyin'],
            'zhuyin': row['zhuyin'],
            'meaning': row['meaning'],
            'level': row['level'],
            'lastReview': row['last_review'],
            'nextReview': row['next_review'],
            'correctCount': row['correct_count'],
            'incorrectCount': row['incorrect_count'],
            'streak': row['streak']
        })

    conn.close()
    return jsonify(flashcards)

@app.route('/api/flashcards', methods=['POST'])
def add_flashcard():
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    data = request.json
    character = data.get('character')
    pinyin = data.get('pinyin', '')
    zhuyin = data.get('zhuyin', '')
    meaning = data.get('meaning')

    if not character or not meaning:
        return jsonify({'error': 'Caractère et signification requis'}), 400

    if not pinyin and not zhuyin:
        return jsonify({'error': 'Pinyin ou zhuyin requis'}), 400

    conn = get_db()
    cursor = conn.cursor()

    next_review = datetime.now().isoformat()
    cursor.execute('''
        INSERT INTO flashcards (user_id, character, pinyin, zhuyin, meaning, next_review)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (session['user_id'], character, pinyin if pinyin else None, zhuyin if zhuyin else None, meaning, next_review))

    conn.commit()
    card_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'id': card_id,
        'character': character,
        'pinyin': pinyin if pinyin else None,
        'zhuyin': zhuyin if zhuyin else None,
        'meaning': meaning,
        'level': 0,
        'lastReview': None,
        'nextReview': next_review,
        'correctCount': 0,
        'incorrectCount': 0,
        'streak': 0
    })

@app.route('/api/flashcards/<int:card_id>', methods=['PUT'])
def update_flashcard(card_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    data = request.json

    conn = get_db()
    cursor = conn.cursor()

    # Verify ownership
    cursor.execute('SELECT id FROM flashcards WHERE id = ? AND user_id = ?',
                   (card_id, session['user_id']))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Carte non trouvée'}), 404

    # Update card
    cursor.execute('''
        UPDATE flashcards
        SET level = ?, last_review = ?, next_review = ?,
            correct_count = ?, incorrect_count = ?, streak = ?
        WHERE id = ? AND user_id = ?
    ''', (
        data.get('level'),
        data.get('lastReview'),
        data.get('nextReview'),
        data.get('correctCount'),
        data.get('incorrectCount'),
        data.get('streak'),
        card_id,
        session['user_id']
    ))

    conn.commit()
    conn.close()

    return jsonify({'success': True})

@app.route('/api/flashcards/<int:card_id>', methods=['DELETE'])
def delete_flashcard(card_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('DELETE FROM flashcards WHERE id = ? AND user_id = ?',
                   (card_id, session['user_id']))

    conn.commit()
    conn.close()

    return jsonify({'success': True})

@app.route('/api/flashcards/clear', methods=['DELETE'])
def clear_all_flashcards():
    if 'user_id' not in session:
        return jsonify({'error': 'Non authentifié'}), 401

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('DELETE FROM flashcards WHERE user_id = ?', (session['user_id'],))

    conn.commit()
    conn.close()

    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
