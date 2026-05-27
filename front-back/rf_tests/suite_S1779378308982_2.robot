*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for login, failed login and logout scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Fill In Login Form With Valid Credentials
    And Submit The Login Form
    Then Verify User Is Logged In Successfully


TC_002 — Failed Login With Incorrect Password

    When Fill In Login Form With Invalid Password
    And Submit The Login Form
    Then Verify User Sees An Invalid Password Error


TC_003 — Logout After Successful Login

    And Fill In Login Form With Valid Credentials
    And Submit The Login Form
    And Verify User Is Logged In Successfully
    When Log Out From The Secure Page
    Then Verify User Is Logged Out Successfully
