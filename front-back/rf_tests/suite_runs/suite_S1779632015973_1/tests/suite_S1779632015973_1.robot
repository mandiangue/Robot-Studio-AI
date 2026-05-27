*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login test suite for https://the-internet.herokuapp.com/login
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779632015973_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779632015973_1/resources/keywords.robot


*** Test Cases ***
TC_001 — Login With Valid Credentials
    [Documentation]    Verify that a user can log in with valid credentials and sees the welcome message
    [Tags]    login    positive

    And Enter Valid Credentials
    When Submit Login Form
    Then User Is Redirected To Secure Page

TC_002 — Login With Wrong Password
    [Documentation]    Verify that login fails with a wrong password and an error message is displayed
    [Tags]    login    negative

    And Enter Credentials With Wrong Password
    When Submit Login Form
    Then User Remains On Login Page With Password Error

TC_003 — Login With Wrong Username
    [Documentation]    Verify that login fails with an invalid username and an error message is displayed
    [Tags]    login    negative

    And Enter Credentials With Wrong Username
    When Submit Login Form
    Then User Remains On Login Page With Username Error

TC_004 — Logout After Successful Login
    [Documentation]    Verify that a logged-in user can log out and is redirected to the login page
    [Tags]    login    logout

    And Enter Valid Credentials
    And Submit Login Form
    And User Is Redirected To Secure Page
    When User Logs Out
    Then User Is Redirected To Login Page After Logout