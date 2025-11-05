"""
Comprehensive test suite for the Chinese Flashcards Flask application.
Tests user authentication, flashcard CRUD operations, and edge cases.
"""

import pytest
import json
import os
from app import app, init_db, get_db, hash_password
from datetime import datetime


# Test configuration
TEST_DATABASE = 'test_flashcards.db'


@pytest.fixture
def client():
    """Create a test client with a fresh test database."""
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test_secret_key'

    # Use a test database
    app.config['DATABASE'] = TEST_DATABASE

    # Override the DATABASE constant in app module
    import app as app_module
    original_db = app_module.DATABASE
    app_module.DATABASE = TEST_DATABASE

    # Remove test database if it exists
    if os.path.exists(TEST_DATABASE):
        os.remove(TEST_DATABASE)

    # Initialize test database
    init_db()

    with app.test_client() as client:
        with app.app_context():
            yield client

    # Cleanup
    app_module.DATABASE = original_db
    if os.path.exists(TEST_DATABASE):
        os.remove(TEST_DATABASE)


@pytest.fixture
def authenticated_client(client):
    """Create a test client with an authenticated user."""
    # Register a test user
    client.post('/api/register',
                json={'name': 'testuser', 'password': 'testpass123'})
    return client


# ============================================================================
# AUTHENTICATION TESTS
# ============================================================================

class TestAuthentication:
    """Test user registration, login, and logout."""

    def test_register_success(self, client):
        """Test successful user registration."""
        response = client.post('/api/register', json={
            'name': 'newuser',
            'password': 'password123'
        })

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['user_name'] == 'newuser'

    def test_register_duplicate_username(self, client):
        """Test registration with duplicate username fails."""
        # Register first user
        client.post('/api/register', json={
            'name': 'duplicate',
            'password': 'pass1'
        })

        # Try to register with same username
        response = client.post('/api/register', json={
            'name': 'duplicate',
            'password': 'pass2'
        })

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'existe déjà' in data['error']

    def test_register_missing_fields(self, client):
        """Test registration with missing fields fails."""
        # Missing password
        response = client.post('/api/register', json={'name': 'test'})
        assert response.status_code == 400

        # Missing username
        response = client.post('/api/register', json={'password': 'test'})
        assert response.status_code == 400

        # Missing both
        response = client.post('/api/register', json={})
        assert response.status_code == 400

    def test_login_success(self, client):
        """Test successful login."""
        # Register user
        client.post('/api/register', json={
            'name': 'loginuser',
            'password': 'loginpass'
        })

        # Logout
        client.post('/api/logout')

        # Login
        response = client.post('/api/login', json={
            'name': 'loginuser',
            'password': 'loginpass'
        })

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['user_name'] == 'loginuser'

    def test_login_wrong_password(self, client):
        """Test login with wrong password fails."""
        # Register user
        client.post('/api/register', json={
            'name': 'user1',
            'password': 'correct'
        })

        # Logout
        client.post('/api/logout')

        # Try wrong password
        response = client.post('/api/login', json={
            'name': 'user1',
            'password': 'wrong'
        })

        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'incorrect' in data['error']

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user fails."""
        response = client.post('/api/login', json={
            'name': 'ghost',
            'password': 'pass'
        })

        assert response.status_code == 401

    def test_logout(self, authenticated_client):
        """Test logout clears session."""
        response = authenticated_client.post('/api/logout')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True

        # Verify session is cleared by trying to access protected route
        response = authenticated_client.get('/api/flashcards')
        assert response.status_code == 401

    def test_check_auth_authenticated(self, authenticated_client):
        """Test check-auth returns true for authenticated user."""
        response = authenticated_client.get('/api/check-auth')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['authenticated'] is True
        assert data['user_name'] == 'testuser'

    def test_check_auth_not_authenticated(self, client):
        """Test check-auth returns false for unauthenticated user."""
        response = client.get('/api/check-auth')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['authenticated'] is False


# ============================================================================
# FLASHCARD CRUD TESTS
# ============================================================================

class TestFlashcardCRUD:
    """Test flashcard creation, reading, updating, and deletion."""

    def test_add_flashcard_with_pinyin(self, authenticated_client):
        """Test adding a flashcard with pinyin only."""
        response = authenticated_client.post('/api/flashcards', json={
            'character': '你好',
            'pinyin': 'nǐ hǎo',
            'meaning': 'bonjour'
        })

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['character'] == '你好'
        assert data['pinyin'] == 'nǐ hǎo'
        assert data['meaning'] == 'bonjour'
        assert data['level'] == 0
        assert data['correctCount'] == 0
        assert 'id' in data

    def test_add_flashcard_with_zhuyin(self, authenticated_client):
        """Test adding a flashcard with zhuyin only."""
        response = authenticated_client.post('/api/flashcards', json={
            'character': '謝謝',
            'zhuyin': 'ㄒㄧㄝˋ ㄒㄧㄝ˙',
            'meaning': 'merci'
        })

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['character'] == '謝謝'
        assert data['zhuyin'] == 'ㄒㄧㄝˋ ㄒㄧㄝ˙'
        assert data['pinyin'] is None

    def test_add_flashcard_with_both(self, authenticated_client):
        """Test adding a flashcard with both pinyin and zhuyin."""
        response = authenticated_client.post('/api/flashcards', json={
            'character': '再見',
            'pinyin': 'zàijiàn',
            'zhuyin': 'ㄗㄞˋ ㄐㄧㄢˋ',
            'meaning': 'au revoir'
        })

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['pinyin'] == 'zàijiàn'
        assert data['zhuyin'] == 'ㄗㄞˋ ㄐㄧㄢˋ'

    def test_add_flashcard_missing_pronunciation(self, authenticated_client):
        """Test adding flashcard without pinyin or zhuyin fails."""
        response = authenticated_client.post('/api/flashcards', json={
            'character': '我',
            'meaning': 'je'
        })

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'Pinyin ou zhuyin requis' in data['error']

    def test_add_flashcard_missing_character(self, authenticated_client):
        """Test adding flashcard without character fails."""
        response = authenticated_client.post('/api/flashcards', json={
            'pinyin': 'nǐ',
            'meaning': 'tu'
        })

        assert response.status_code == 400

    def test_add_flashcard_unauthenticated(self, client):
        """Test adding flashcard without authentication fails."""
        response = client.post('/api/flashcards', json={
            'character': '你',
            'pinyin': 'nǐ',
            'meaning': 'tu'
        })

        assert response.status_code == 401

    def test_get_flashcards_empty(self, authenticated_client):
        """Test getting flashcards when none exist."""
        response = authenticated_client.get('/api/flashcards')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data == []

    def test_get_flashcards_multiple(self, authenticated_client):
        """Test getting multiple flashcards."""
        # Add multiple cards
        cards = [
            {'character': '一', 'pinyin': 'yī', 'meaning': 'un'},
            {'character': '二', 'pinyin': 'èr', 'meaning': 'deux'},
            {'character': '三', 'pinyin': 'sān', 'meaning': 'trois'}
        ]

        for card in cards:
            authenticated_client.post('/api/flashcards', json=card)

        # Get all cards
        response = authenticated_client.get('/api/flashcards')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 3
        assert all('id' in card for card in data)
        assert all('character' in card for card in data)

    def test_get_flashcards_unauthenticated(self, client):
        """Test getting flashcards without authentication fails."""
        response = client.get('/api/flashcards')
        assert response.status_code == 401

    def test_update_flashcard(self, authenticated_client):
        """Test updating a flashcard's progress."""
        # Add a card
        response = authenticated_client.post('/api/flashcards', json={
            'character': '你好',
            'pinyin': 'nǐ hǎo',
            'meaning': 'bonjour'
        })
        card = json.loads(response.data)
        card_id = card['id']

        # Update the card
        now = datetime.now().isoformat()
        response = authenticated_client.put(f'/api/flashcards/{card_id}', json={
            'level': 2,
            'lastReview': now,
            'nextReview': now,
            'correctCount': 5,
            'incorrectCount': 1,
            'streak': 3
        })

        assert response.status_code == 200

        # Verify update
        response = authenticated_client.get('/api/flashcards')
        cards = json.loads(response.data)
        updated_card = cards[0]
        assert updated_card['level'] == 2
        assert updated_card['correctCount'] == 5
        assert updated_card['streak'] == 3

    def test_update_nonexistent_flashcard(self, authenticated_client):
        """Test updating non-existent flashcard fails."""
        response = authenticated_client.put('/api/flashcards/99999', json={
            'level': 1,
            'correctCount': 1
        })

        assert response.status_code == 404

    def test_delete_flashcard(self, authenticated_client):
        """Test deleting a flashcard."""
        # Add a card
        response = authenticated_client.post('/api/flashcards', json={
            'character': '你好',
            'pinyin': 'nǐ hǎo',
            'meaning': 'bonjour'
        })
        card = json.loads(response.data)
        card_id = card['id']

        # Delete the card
        response = authenticated_client.delete(f'/api/flashcards/{card_id}')
        assert response.status_code == 200

        # Verify deletion
        response = authenticated_client.get('/api/flashcards')
        cards = json.loads(response.data)
        assert len(cards) == 0

    def test_delete_nonexistent_flashcard(self, authenticated_client):
        """Test deleting non-existent flashcard succeeds (idempotent)."""
        response = authenticated_client.delete('/api/flashcards/99999')
        assert response.status_code == 200

    def test_clear_all_flashcards(self, authenticated_client):
        """Test clearing all flashcards."""
        # Add multiple cards
        for i in range(5):
            authenticated_client.post('/api/flashcards', json={
                'character': f'字{i}',
                'pinyin': f'zi{i}',
                'meaning': f'word{i}'
            })

        # Clear all
        response = authenticated_client.delete('/api/flashcards/clear')
        assert response.status_code == 200

        # Verify all deleted
        response = authenticated_client.get('/api/flashcards')
        cards = json.loads(response.data)
        assert len(cards) == 0


# ============================================================================
# DATA ISOLATION TESTS
# ============================================================================

class TestDataIsolation:
    """Test that users can only access their own data."""

    def test_users_see_only_own_flashcards(self, client):
        """Test users can only see their own flashcards."""
        # Create user 1
        client.post('/api/register', json={
            'name': 'user1',
            'password': 'pass1'
        })

        # Add cards for user 1
        client.post('/api/flashcards', json={
            'character': '你',
            'pinyin': 'nǐ',
            'meaning': 'tu'
        })

        # Logout user 1
        client.post('/api/logout')

        # Create user 2
        client.post('/api/register', json={
            'name': 'user2',
            'password': 'pass2'
        })

        # Add cards for user 2
        client.post('/api/flashcards', json={
            'character': '我',
            'pinyin': 'wǒ',
            'meaning': 'je'
        })

        # User 2 should only see their own card
        response = client.get('/api/flashcards')
        cards = json.loads(response.data)
        assert len(cards) == 1
        assert cards[0]['character'] == '我'

    def test_users_cannot_delete_others_flashcards(self, client):
        """Test users cannot delete other users' flashcards."""
        # Create user 1 and add a card
        client.post('/api/register', json={
            'name': 'user1',
            'password': 'pass1'
        })

        response = client.post('/api/flashcards', json={
            'character': '你',
            'pinyin': 'nǐ',
            'meaning': 'tu'
        })
        card_id = json.loads(response.data)['id']

        # Logout and create user 2
        client.post('/api/logout')
        client.post('/api/register', json={
            'name': 'user2',
            'password': 'pass2'
        })

        # User 2 tries to delete user 1's card
        response = client.delete(f'/api/flashcards/{card_id}')

        # Should succeed but not actually delete (ownership check)
        assert response.status_code == 200

        # Login as user 1 and verify card still exists
        client.post('/api/logout')
        client.post('/api/login', json={
            'name': 'user1',
            'password': 'pass1'
        })

        response = client.get('/api/flashcards')
        cards = json.loads(response.data)
        assert len(cards) == 1


# ============================================================================
# EDGE CASES AND VALIDATION TESTS
# ============================================================================

class TestEdgeCases:
    """Test edge cases and input validation."""

    def test_empty_string_fields(self, authenticated_client):
        """Test handling of empty string fields."""
        response = authenticated_client.post('/api/flashcards', json={
            'character': '',
            'pinyin': 'test',
            'meaning': 'test'
        })

        assert response.status_code == 400

    def test_unicode_characters(self, authenticated_client):
        """Test handling of various Unicode characters."""
        # Traditional Chinese
        response = authenticated_client.post('/api/flashcards', json={
            'character': '繁體字',
            'pinyin': 'fántǐzì',
            'meaning': 'caractères traditionnels'
        })
        assert response.status_code == 200

        # Simplified Chinese (should also work)
        response = authenticated_client.post('/api/flashcards', json={
            'character': '简体字',
            'pinyin': 'jiǎntǐzì',
            'meaning': 'caractères simplifiés'
        })
        assert response.status_code == 200

        # Zhuyin with tone marks
        response = authenticated_client.post('/api/flashcards', json={
            'character': '我',
            'zhuyin': 'ㄨㄛˇ',
            'meaning': 'je'
        })
        assert response.status_code == 200

    def test_very_long_strings(self, authenticated_client):
        """Test handling of very long input strings."""
        long_string = 'a' * 1000

        response = authenticated_client.post('/api/flashcards', json={
            'character': long_string,
            'pinyin': 'test',
            'meaning': 'test'
        })

        # Should succeed (no length limit enforced)
        assert response.status_code == 200

    def test_special_characters_in_password(self, client):
        """Test passwords with special characters."""
        response = client.post('/api/register', json={
            'name': 'specialuser',
            'password': 'p@$$w0rd!#%&*'
        })

        assert response.status_code == 200

        # Test login with special password
        client.post('/api/logout')
        response = client.post('/api/login', json={
            'name': 'specialuser',
            'password': 'p@$$w0rd!#%&*'
        })

        assert response.status_code == 200

    def test_whitespace_in_username(self, client):
        """Test usernames with whitespace."""
        response = client.post('/api/register', json={
            'name': 'user with spaces',
            'password': 'password'
        })

        assert response.status_code == 200

        # Should be able to login
        client.post('/api/logout')
        response = client.post('/api/login', json={
            'name': 'user with spaces',
            'password': 'password'
        })

        assert response.status_code == 200


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

class TestIntegration:
    """Test complete user workflows."""

    def test_complete_user_workflow(self, client):
        """Test a complete user session from registration to deletion."""
        # Register
        response = client.post('/api/register', json={
            'name': 'completeuser',
            'password': 'pass123'
        })
        assert response.status_code == 200

        # Add multiple flashcards
        cards_data = [
            {'character': '你好', 'pinyin': 'nǐ hǎo', 'meaning': 'bonjour'},
            {'character': '謝謝', 'pinyin': 'xièxie', 'meaning': 'merci'},
            {'character': '再見', 'zhuyin': 'ㄗㄞˋ ㄐㄧㄢˋ', 'meaning': 'au revoir'},
        ]

        card_ids = []
        for card_data in cards_data:
            response = client.post('/api/flashcards', json=card_data)
            assert response.status_code == 200
            card_ids.append(json.loads(response.data)['id'])

        # Retrieve all cards
        response = client.get('/api/flashcards')
        cards = json.loads(response.data)
        assert len(cards) == 3

        # Update one card (simulate review)
        now = datetime.now().isoformat()
        response = client.put(f'/api/flashcards/{card_ids[0]}', json={
            'level': 1,
            'lastReview': now,
            'nextReview': now,
            'correctCount': 1,
            'incorrectCount': 0,
            'streak': 1
        })
        assert response.status_code == 200

        # Delete one card
        response = client.delete(f'/api/flashcards/{card_ids[1]}')
        assert response.status_code == 200

        # Verify state
        response = client.get('/api/flashcards')
        cards = json.loads(response.data)
        assert len(cards) == 2

        # Clear all cards
        response = client.delete('/api/flashcards/clear')
        assert response.status_code == 200

        response = client.get('/api/flashcards')
        cards = json.loads(response.data)
        assert len(cards) == 0

        # Logout
        response = client.post('/api/logout')
        assert response.status_code == 200


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
