*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation       Tests for Login functionality on The Internet
Library             SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779727684194_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779727684194_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    Given User Is On The Login Page
    When User Logs In With Valid Credentials
    Then User Should See Success Message

TC_002 — Failed Login With Incorrect Password
    Given User Is On The Login Page
    When User Logs In With Wrong Password
    Then User Should See Invalid Password Error

TC_003 — Failed Login With Incorrect Username
    Given User Is On The Login Page
    When User Logs In With Wrong Username
    Then User Should See Invalid Username Error

TC_004 — Logout After Successful Login
    Given User Is On The Login Page
    When User Logs In With Valid Credentials
    Then User Should See Success Message
    When User Clicks Logout
    Then User Should See Logout Confirmation Message