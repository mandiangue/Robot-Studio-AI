*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests Login - The Internet Herokuapp
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780228984239_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780228984239_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When User Enters Valid Credentials
    And User Clicks The Login Button
    Then User Should See Success Message

TC_002 — Failed Login With Wrong Password

    When User Enters Invalid Password
    And User Clicks The Login Button
    Then User Should See Invalid Password Error

TC_003 — Failed Login With Wrong Username

    When User Enters Invalid Username
    And User Clicks The Login Button
    Then User Should See Invalid Username Error

TC_004 — Logout After Successful Login

    When User Enters Valid Credentials
    And User Clicks The Login Button
    And User Clicks The Logout Button
    Then User Should Be Redirected To Login Page With Logout Message