*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests for Login functionality on The Internet
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780230829359_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780230829359_2/resources/keywords.robot



*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Should See Success Message

TC_002 — Failed Login With Wrong Password

    When User Enters Wrong Password
    And User Clicks Login Button
    Then User Should See Wrong Password Error

TC_003 — Failed Login With Wrong Username

    When User Enters Wrong Username
    And User Clicks Login Button
    Then User Should See Wrong Username Error

TC_004 — Logout After Successful Login

    When User Enters Valid Credentials
    And User Clicks Login Button
    And User Clicks Logout Button
    Then User Should See Logout Confirmation
    And User Should Be Redirected To Login Page