*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests for the-internet.herokuapp.com login scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780233867743_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780233867743_2/resources/keywords.robot



*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    Given The Login Page Is Open
    When The User Enters Valid Credentials
    And When The User Clicks The Login Button
    Then The User Should See The Success Message

TC_002 — Failed Login With Wrong Password
    Given The Login Page Is Open
    When The User Enters Invalid Password
    And When The User Clicks The Login Button
    Then The User Should See The Wrong Password Error

TC_003 — Failed Login With Wrong Username
    Given The Login Page Is Open
    When The User Enters Invalid Username
    And When The User Clicks The Login Button
    Then The User Should See The Wrong Username Error

TC_004 — Logout After Successful Login
    Given The Login Page Is Open
    When The User Enters Valid Credentials
    And When The User Clicks The Login Button
    And The User Should See The Success Message
    When The User Clicks The Logout Button
    Then The User Should Be Redirected To The Login Page
    And The User Should See The Logout Confirmation Message