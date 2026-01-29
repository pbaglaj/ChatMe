Feature: Publishing posts on the timeline

  Scenario: Logged-in user publishes a post
    Given the user is successfully logged in
    When the user submits a new post with content "BDD test entry"
    Then the server returns status code 201
    And the response contains the created post with content "BDD test entry"

  Scenario: Unauthenticated user cannot publish a post
    Given the user is not logged in
    When the user attempts to submit a post
    Then the server returns status code 401