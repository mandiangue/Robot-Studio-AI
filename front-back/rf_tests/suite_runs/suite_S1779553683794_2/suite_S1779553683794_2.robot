*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo application
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    [Documentation]    Verify that a user can log in with valid credentials and is redirected to the Products page.
    [Tags]             login    smoke

    When Fill In Login Form With Valid Credentials
    And Submit Login Form
    Then Verify Products Page Is Displayed


TC_002 — Add A Product To The Cart
    [Documentation]    Verify that after login, adding the first product to the cart updates the cart badge to 1 and changes the button to Remove.
    [Tags]             cart    smoke

    And Fill In Login Form With Valid Credentials
    And Submit Login Form
    And Verify Products Page Is Displayed
    When Add First Product To Cart
    Then Verify Cart Badge Displays One
    And Verify First Product Button Changed To Remove


TC_003 — Failed Login With Incorrect Password
    [Documentation]    Verify that logging in with a wrong password displays an error message and keeps the user on the login page.
    [Tags]             login    negative

    When Fill In Login Form With Invalid Password
    And Submit Login Form
    Then Verify Error Message Is Displayed
    And Verify User Stays On Login Page
