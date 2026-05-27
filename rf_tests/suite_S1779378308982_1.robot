*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo login scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    [Documentation]    Verify that a user with valid credentials is redirected to the products page
    [Tags]             login    positive

    When Enter Valid Credentials
    And Click On Login Button
    Then User Is Redirected To Products Page


TC_002 — Failed Login With Incorrect Password
    [Documentation]    Verify that an error message is shown when an incorrect password is used
    [Tags]             login    negative

    When Enter Credentials With Wrong Password
    And Click On Login Button
    Then An Error Message Is Shown For Wrong Password
    And User Remains On Login Page


TC_003 — Failed Login With Locked Out User
    [Documentation]    Verify that a locked user cannot access the application and sees an error message
    [Tags]             login    negative    locked

    When Enter Locked User Credentials
    And Click On Login Button
    Then An Error Message Is Shown For Locked User
    And User Remains On Login Page
