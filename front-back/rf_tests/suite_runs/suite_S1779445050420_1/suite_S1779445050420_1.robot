*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for Login Functionality
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
Login Successful With Valid Credentials
    [Documentation]    TC_001 — Verify successful login with valid username and password
    Open Login Page
    Login With Valid Credentials
    Verify Successful Login


Login Failed With Incorrect Password
    [Documentation]    TC_002 — Verify login fails with correct username and incorrect password
    Open Login Page
    Login With Invalid Password
    Verify Failed Login With Invalid Password


Login Failed With Incorrect Username
    [Documentation]    TC_003 — Verify login fails with incorrect username and correct password
    Open Login Page
    Login With Invalid Username
    Verify Failed Login With Invalid Username
