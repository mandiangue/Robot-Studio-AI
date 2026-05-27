*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login test suite for https://the-internet.herokuapp.com/login
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    [Documentation]    Verify that a user can log in successfully with valid credentials
    ...                and is redirected to the secure area with a success message.
    [Tags]             login    positive

    When Enter Valid Credentials
    And Click On Login Button
    Then Verify Successful Login

TC_002 — Failed Login With Wrong Password
    [Documentation]    Verify that a user cannot log in with an incorrect password
    ...                and an error message 'Your password is invalid!' is displayed in red.
    [Tags]             login    negative

    When Enter Credentials With Wrong Password
    And Click On Login Button
    Then Verify Password Error Message

TC_003 — Failed Login With Wrong Username
    [Documentation]    Verify that a user cannot log in with an invalid username
    ...                and an error message 'Your username is invalid!' is displayed in red.
    [Tags]             login    negative

    When Enter Credentials With Wrong Username
    And Click On Login Button
    Then Verify Username Error Message