from behave import given, when, then
import requests
import uuid

BASE_URL = "https://localhost:5000/api"

@given('the user has a unique username and password')
def step_impl(context):
    unique_id = str(uuid.uuid4())[:8]
    context.username = f"bdd_user_{unique_id}"
    context.password = "Secret123!"
    context.user_data = {
        "username": context.username,
        "password": context.password
    }

@when('the user sends a registration request')
def step_impl(context):
    context.response = requests.post(
        f"{BASE_URL}/auth/register",
        json=context.user_data,
        verify=False
    )

@then('the server returns status code {status_code:d}')
def step_impl(context, status_code):
    assert context.response.status_code == status_code, \
        f"Expected {status_code}, got {context.response.status_code}. Body: {context.response.text}"

@then('the response contains the message "{message}"')
def step_impl(context, message):
    json_data = context.response.json()
    actual_message = json_data.get("message", "")
    assert message in actual_message, \
        f"Expected message '{message}', but got '{actual_message}'"

@given('the user is registered in the system')
def step_impl(context):
    context.execute_steps(u'''
        Given the user has a unique username and password
        When the user sends a registration request
    ''')
    assert context.response.status_code == 201

@when('the user attempts to log in with an incorrect password')
def step_impl(context):
    bad_data = {
        "username": context.username,
        "password": "WrongPassword"
    }
    context.response = requests.post(
        f"{BASE_URL}/auth/login",
        json=bad_data,
        verify=False
    )

@given('the user is successfully logged in')
def step_impl(context):
    context.execute_steps(u'Given the user is registered in the system')
    
    context.session = requests.Session()
    login_response = context.session.post(
        f"{BASE_URL}/auth/login",
        json=context.user_data,
        verify=False
    )
    assert login_response.status_code == 200

@when('the user submits a new post with content "{content}"')
def step_impl(context, content):
    post_data = {"content": content}
    context.response = context.session.post(
        f"{BASE_URL}/posts",
        json=post_data,
        verify=False
    )

@then('the response contains the created post with content "{content}"')
def step_impl(context, content):
    json_data = context.response.json()
    assert "post" in json_data, "Response does not contain 'post' object"
    assert json_data["post"]["content"] == content

@given('the user is not logged in')
def step_impl(context):
    context.session = requests.Session()

@when('the user attempts to submit a post')
def step_impl(context):
    context.response = context.session.post(
        f"{BASE_URL}/posts",
        json={"content": "Unauthorized post"},
        verify=False
    )