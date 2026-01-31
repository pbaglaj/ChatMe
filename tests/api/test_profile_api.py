import requests
import uuid
import pytest

URL_PROFILE = "https://localhost:5000/api/profile"
URL_AUTH = "https://localhost:5000/api/auth"

class TestProfileAPI:
  @pytest.fixture
  def logged_in_session(self):
    session = requests.Session()
    unique_id = str(uuid.uuid4())[:8]
    username = f"sess_user_{unique_id}"
    password = "Password123!"

    requests.post(f"{URL_AUTH}/register", json={
        "username": username,
        "password": password
    }, verify=False)

    login_res = session.post(f"{URL_AUTH}/login", json={
        "username": username,
        "password": password
    }, verify=False)
    
    assert login_res.status_code == 200
    return session, username

  def test_update_bio_success(self, logged_in_session):
      session, _ = logged_in_session
      new_bio = "To jest moje nowe, zaktualizowane bio!"

      response = session.put(f"{URL_PROFILE}/", json={"bio": new_bio}, verify=False)

      assert response.status_code == 200
      data = response.json()
      assert data["message"] == "Profile updated successfully"
      assert data["user"]["bio"] == new_bio

      get_response = session.get(f"{URL_PROFILE}/", verify=False)
      assert get_response.status_code == 200
      assert get_response.json()["user"]["bio"] == new_bio