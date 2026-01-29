from locust import HttpUser, task, between
import uuid
import urllib3

# Turn off warnings about unverified HTTPS requests
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class ChatMeUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        unique_id = str(uuid.uuid4())[:8]
        self.username = f"perf_user_{unique_id}"
        self.password = "PerfPass123!"

        self.client.post("/api/auth/register", json={
            "username": self.username,
            "password": self.password
        }, verify=False)

    @task
    def login_stress_test(self):
        response = self.client.post("/api/auth/login", json={
            "username": self.username,
            "password": self.password
        }, verify=False)

        if response.status_code != 200:
            response.failure(f"Login failed with status {response.status_code}")