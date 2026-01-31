from urllib import response
import requests
import uuid
import pytest

BASE_URL = "https://localhost:5000/api/auth"

class TestAuthAPI:
    def generate_user_data(self):
        unique_id = str(uuid.uuid4())[:8]
        return {
            "username": f"user_{unique_id}",
            "password": "SecretPassword123!"
        }

    def test_register_success(self):
        payload = self.generate_user_data()
        
        response = requests.post(f"{BASE_URL}/register", json=payload, verify=False)
        
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "User successfully registered"
        assert "user" in data
        assert data["user"]["username"] == payload["username"]

    def test_register_missing_password(self):
        payload = {"username": "incomplete_user"}
        
        response = requests.post(f"{BASE_URL}/register", json=payload, verify=False)
        
        assert response.status_code == 400
        assert "Username and password are required" in response.json()["message"]

    def test_register_duplicate_user(self):
        payload = self.generate_user_data()
        
        requests.post(f"{BASE_URL}/register", json=payload, verify=False)
        
        response = requests.post(f"{BASE_URL}/register", json=payload, verify=False)
        
        assert response.status_code == 400
        assert "User with this username already exists" in response.json()["message"]

    def test_login_success(self):
        user_data = self.generate_user_data()
        requests.post(f"{BASE_URL}/register", json=user_data, verify=False)

        login_payload = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        
        response = requests.post(f"{BASE_URL}/login", json=login_payload, verify=False)
        
        assert response.status_code == 200
        assert response.json()["message"] == "Login successful"
        
        assert "auth_token" in response.cookies

    def test_login_invalid_password(self):
        user_data = self.generate_user_data()
        requests.post(f"{BASE_URL}/register", json=user_data, verify=False)

        bad_payload = {
            "username": user_data["username"],
            "password": "WrongPassword"
        }
        
        response = requests.post(f"{BASE_URL}/login", json=bad_payload, verify=False)
        
        assert response.status_code == 401
        assert "Invalid login credentials" in response.json()["message"]

    def test_login_non_existent_user(self):
        payload = {
            "username": "ghost_user_12345",
            "password": "password"
        }
        
        response = requests.post(f"{BASE_URL}/login", json=payload, verify=False)
        
        assert response.status_code == 401

    @pytest.fixture
    def logged_in_session(self):
        session = requests.Session()
        unique_id = str(uuid.uuid4())[:8]
        username = f"sess_user_{unique_id}"
        password = "Password123!"

        requests.post(f"{BASE_URL}/register", json={
            "username": username,
            "password": password
        }, verify=False)

        login_res = session.post(f"{BASE_URL}/login", json={
            "username": username,
            "password": password
        }, verify=False)
        
        assert login_res.status_code == 200
        return session, username
    
    def test_logout_success(self, logged_in_session):
        session, _ = logged_in_session
        
        logout_res = session.post(f"{BASE_URL}/logout", verify=False)
        
        assert logout_res.status_code == 200
        assert logout_res.json()["message"] == "Logged out successfully"
        
        check_res = session.get(f"{BASE_URL}/check", verify=False)
        
        assert check_res.status_code == 200
        assert check_res.json()["loggedIn"] is False

    def test_check_not_logged_in(self):
        response = requests.get(f"{BASE_URL}/check", verify=False)
        
        assert response.status_code == 200
        data = response.json()
        assert data["loggedIn"] is False
        assert "user" not in data

    def test_logout_unauthorized(self):
        response = requests.post(f"{BASE_URL}/logout", verify=False)

        assert response.status_code in [401, 403]