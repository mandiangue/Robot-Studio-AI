*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login test suite for the-internet.herokuapp.com
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Click On Login Button
    Then User Should See Success Message

TC_002 — Failed Login With Incorrect Password

    When Enter Credentials With Invalid Password
    And Click On Login Button
    Then User Should See Invalid Password Error Message

TC_003 — Failed Login With Incorrect Username

    When Enter Credentials With Invalid Username
    And Click On Login Button
    Then User Should See Invalid Username Error Message