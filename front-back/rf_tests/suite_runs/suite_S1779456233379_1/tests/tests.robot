*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    [Documentation]    Verify that user can login with valid credentials 'tomsmith' and 'SuperSecretPassword!' on login page
    Open Login Page
    Login With Credentials    ${VALID_USERNAME}    ${VALID_PASSWORD}
    Verify Successful Login


TC_002 Login Attempt With Invalid Password
    [Documentation]    Verify that login fails when entering username 'tomsmith' with incorrect password 'WrongPassword'
    Open Login Page
    Login With Credentials    ${VALID_USERNAME}    ${INVALID_PASSWORD}
    Verify Login Failed With Invalid Password
    Verify User Is On Login Page


TC_003 Login Attempt With Invalid Username
    [Documentation]    Verify that login fails when entering incorrect username 'wronguser' with correct password 'SuperSecretPassword!'
    Open Login Page
    Login With Credentials    ${INVALID_USERNAME}    ${VALID_PASSWORD}
    Verify Login Failed With Invalid Username
    Verify User Is On Login Page