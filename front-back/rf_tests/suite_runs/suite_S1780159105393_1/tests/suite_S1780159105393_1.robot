*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--headless=new");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage");add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic");
Suite Teardown    Close Browser
Documentation    Tests Login Page - the-internet.herokuapp.com
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780159105393_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780159105393_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    Given The User Is On The Login Page
    When The User Enters Valid Credentials
    And The User Clicks The Login Button
    Then The User Should See The Success Message

TC_002 — Failed Login With Incorrect Password
    Given The User Is On The Login Page
    When The User Enters Wrong Password Credentials
    And The User Clicks The Login Button
    Then The User Should Remain On The Login Page
    And The User Should See The Wrong Password Error Message

TC_003 — Failed Login With Incorrect Username
    Given The User Is On The Login Page
    When The User Enters Wrong Username Credentials
    And The User Clicks The Login Button
    Then The User Should Remain On The Login Page
    And The User Should See The Wrong Username Error Message

TC_004 — Logout After Successful Login
    Given The User Is On The Login Page
    When The User Enters Valid Credentials
    And The User Clicks The Login Button
    And The User Should See The Success Flash Message
    When The User Clicks The Logout Button
    Then The User Should Be Redirected To The Login Page
    And The User Should See The Logout Confirmation Message