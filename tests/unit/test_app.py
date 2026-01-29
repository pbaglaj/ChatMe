import unittest
from unittest.mock import MagicMock

class MockResponse:
    def __init__(self):
        self.status_code = 200
        self.body = {}
        self.cookies = {}

    def status(self, code):
        self.status_code = code
        return self

    def json(self, data):
        self.body = data
        return self
    
    def cookie(self, name, value, httpOnly=False):
        self.cookies[name] = value

class MockRequest:
    def __init__(self, body=None, cookies=None, user=None):
        self.body = body or {}
        self.cookies = cookies or {}
        self.user = user

class AuthController:
    def __init__(self, db, bcrypt, jwt):
        self.db = db
        self.bcrypt = bcrypt
        self.jwt = jwt

    def register(self, req, res):
        username = req.body.get('username')
        password = req.body.get('password')

        if not username or not password:
            return res.status(400).json({"message": "Username and password are required"})

        user_exists = self.db.query("SELECT * FROM users WHERE username = $1", [username])
        if len(user_exists) > 0:
            return res.status(409).json({"message": "User with this username already exists"})

        salt = self.bcrypt.genSalt(10)
        password_hash = self.bcrypt.hash(password, salt)

        new_user = self.db.query(
            "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, user_id, username",
            [username, password_hash]
        )

        return res.status(201).json({
            "message": "User successfully registered",
            "user": new_user[0]
        })

    def login(self, req, res):
        username = req.body.get('username')
        password = req.body.get('password')

        if not username or not password:
            return res.status(400).json({"message": "Username and password are required"})

        user_result = self.db.query("SELECT * FROM users WHERE username = $1", [username])
        if len(user_result) == 0:
            return res.status(401).json({"message": "Invalid login credentials"})
        
        user = user_result[0]

        is_match = self.bcrypt.compare(password, user['password_hash'])
        if not is_match:
            return res.status(401).json({"message": "Invalid login credentials"})

        token = self.jwt.sign({"user": {"id": user['id']}}, "SECRET")
        
        res.cookie('auth_token', token, httpOnly=True)
        return res.status(200).json({"message": "Login successful"})

def auth_middleware(req, res, next_func, jwt_lib):
    token = req.cookies.get('auth_token')
    if not token:
        return res.status(401).json({'message': 'No access. Please log in.'})
    
    try:
        verified = jwt_lib.verify(token, "SECRET")
        req.user = verified['user']
        next_func()
    except:
        return res.status(400).json({'message': 'Invalid token'})

class PostsController:
    def __init__(self, db, notification_service=None):
        self.db = db
        self.notification_service = notification_service

    def create_post(self, req, res):
        user_id = req.user['id']
        content = req.body.get('content')

        if not content:
            return res.status(400).json({"message": "Post content is required"})

        result = self.db.query(
            "INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING id",
            [user_id, content]
        )
        
        username_res = self.db.query("SELECT username FROM users WHERE id = $1", [user_id])
        username = username_res[0]['username']

        friends_res = self.db.query("SELECT friend_id FROM friends WHERE user_id = $1", [user_id])
        
        if self.notification_service:
            for friend in friends_res:
                self.notification_service(friend['friend_id'], {
                    "type": "new_post",
                    "message": f"{username} published a new post!"
                })

        return res.status(201).json({"message": "Post created successfully", "post": result[0]})


class TestChatMeApp(unittest.TestCase):
    def setUp(self):
        self.mock_db = MagicMock()
        self.mock_bcrypt = MagicMock()
        self.mock_jwt = MagicMock()
        
        self.auth_controller = AuthController(self.mock_db, self.mock_bcrypt, self.mock_jwt)
        self.posts_controller = PostsController(self.mock_db)

    def test_register_success(self):
        req = MockRequest(body={"username": "testuser", "password": "password123"})
        res = MockResponse()

        self.mock_db.query.side_effect = [
            [], # SELECT (user not found)
            [{"id": 1, "username": "testuser"}] # INSERT returning
        ]
        
        self.auth_controller.register(req, res)

        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.body['message'], "User successfully registered")
        self.mock_bcrypt.hash.assert_called()

    def test_register_fail_missing_password(self):
        req = MockRequest(body={"username": "testuser"})
        res = MockResponse()

        self.auth_controller.register(req, res)

        self.assertEqual(res.status_code, 400)
        self.assertIn("required", res.body['message'])

    def test_register_fail_user_exists(self):
        req = MockRequest(body={"username": "existing", "password": "123"})
        res = MockResponse()
        
        self.mock_db.query.return_value = [{"id": 5, "username": "existing"}]

        self.auth_controller.register(req, res)

        self.assertEqual(res.status_code, 409)
        self.mock_db.query.assert_called_once()

    def test_login_success(self):
        req = MockRequest(body={"username": "janusz", "password": "pass"})
        res = MockResponse()

        self.mock_db.query.return_value = [{"id": 1, "username": "janusz", "password_hash": "hashed"}]
        self.mock_bcrypt.compare.return_value = True
        self.mock_jwt.sign.return_value = "fake_token_123"

        self.auth_controller.login(req, res)

        self.assertEqual(res.status_code, 200)
        self.assertIn('auth_token', res.cookies)
        self.assertEqual(res.cookies['auth_token'], "fake_token_123")

    def test_login_invalid_password(self):
        req = MockRequest(body={"username": "janusz", "password": "wrongpass"})
        res = MockResponse()

        self.mock_db.query.return_value = [{"id": 1, "password_hash": "hashed"}]
        self.mock_bcrypt.compare.return_value = False

        self.auth_controller.login(req, res)

        self.assertEqual(res.status_code, 401)

    def test_middleware_no_token(self):
        req = MockRequest(cookies={})
        res = MockResponse()
        next_mock = MagicMock()

        auth_middleware(req, res, next_mock, self.mock_jwt)

        self.assertEqual(res.status_code, 401)
        next_mock.assert_not_called()

    def test_middleware_valid_token(self):
        req = MockRequest(cookies={'auth_token': 'valid'})
        res = MockResponse()
        next_mock = MagicMock()

        self.mock_jwt.verify.return_value = {"user": {"id": 123}}

        auth_middleware(req, res, next_mock, self.mock_jwt)

        next_mock.assert_called_once()
        self.assertEqual(req.user['id'], 123)