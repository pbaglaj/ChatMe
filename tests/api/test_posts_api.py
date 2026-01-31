import requests
import uuid
import pytest

URL_POSTS = "https://localhost:5000/api/posts"
URL_AUTH = "https://localhost:5000/api/auth"

class TestPostsAPI:
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
  
  def test_delete_own_post_success(self, logged_in_session):
        session, _ = logged_in_session

        create_res = session.post(f"{URL_POSTS}", json={"content": "Post to delete"}, verify=False)
        assert create_res.status_code == 201
        post_id = create_res.json()["post"]["id"]

        delete_res = session.delete(f"{URL_POSTS}/{post_id}", verify=False)
        
        assert delete_res.status_code == 200
        assert delete_res.json()["message"] == "Post deleted successfully"

        delete_again = session.delete(f"{URL_POSTS}/{post_id}", verify=False)
        assert delete_again.status_code == 404

  def test_delete_non_existent_post(self, logged_in_session):
      session, _ = logged_in_session
      
      fake_id = 999999
      
      response = session.delete(f"{URL_POSTS}/{fake_id}", verify=False)
      
      assert response.status_code == 404
      assert "Post not found" in response.json()["message"]

  def test_delete_unauthorized(self):
      response = requests.delete(f"{URL_POSTS}/1", verify=False)
      
      assert response.status_code in [401, 403]