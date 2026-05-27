*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login test cases for the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779552902577_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779552902577_1/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Click On Login Button
    Then User Should Be Redirected To Secure Page
    And Success Message Should Be Displayed

TC_002 — Failed Login With Incorrect Password

    When Enter Credentials With Wrong Password
    And Click On Login Button
    Then User Should Stay On Login Page
    And Invalid Password Message Should Be Displayed In Red

TC_003 — Failed Login With Incorrect Username

    When Enter Credentials With Wrong Username
    And Click On Login Button
    Then User Should Stay On Login Page
    And Invalid Username Message Should Be Displayed In Red