Feature: Customer Management
  As a user of the customer management system
  I want to be able to create, read, update, and delete customer records
  So that I can manage customer information effectively

  Scenario: Create a new customer
    Given I have customer details
    When I create a new customer
    Then the customer should be saved successfully

  Scenario: Retrieve a customer
    Given a customer exists in the system
    When I request the customer's details
    Then I should receive the correct customer information

  Scenario: Update a customer
    Given a customer exists in the system
    When I update the customer's information
    Then the customer's details should be updated successfully

  Scenario: Delete a customer
    Given a customer exists in the system
    When I delete the customer
    Then the customer should be removed from the system