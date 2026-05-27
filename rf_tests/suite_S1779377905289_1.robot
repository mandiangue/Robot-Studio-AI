*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for login scenarios on the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Submit Login Form
    Then Verify User Is Redirected To Secure Page

TC_002 — Failed Login With Wrong Password

    When Enter Credentials With Wrong Password
    And Submit Login Form
    Then Verify Password Error Message Is Displayed

TC_003 — Failed Login With Wrong Username

    When Enter Credentials With Wrong Username
    And Submit Login Form
    Then Verify Username Error Message Is Displayed