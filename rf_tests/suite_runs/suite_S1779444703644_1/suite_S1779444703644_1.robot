*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login Application Tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    [Documentation]    Verify that user can login with valid username and password

    Login With Valid Credentials
    Verify Successful Login


TC_002 Failed Login With Invalid Password
    [Documentation]    Verify that login fails with invalid password and error message is displayed

    Login With Invalid Password
    Verify Failed Login With Invalid Password


TC_003 Failed Login With Invalid Username
    [Documentation]    Verify that login fails with invalid username and error message is displayed

    Login With Invalid Username
    Verify Failed Login With Invalid Username
