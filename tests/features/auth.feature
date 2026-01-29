Feature: User Registration and Login

  Scenario: Successful registration of a new user
    Given the user has a unique username and password
    When the user sends a registration request
    Then the server returns status code 201
    And the response contains the message "User successfully registered"

  Scenario: Login attempt with an incorrect password
    Given the user is registered in the system
    When the user attempts to log in with an incorrect password
    Then the server returns status code 401
    And the response contains the message "Invalid login credentials"