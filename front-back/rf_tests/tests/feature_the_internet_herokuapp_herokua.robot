*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests Login - the-internet.herokuapp.com
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot



*** Test Cases ***
TC_001 — Login With Valid Credentials
    Given User Is On The Login Page
    When User Enters Valid Credentials
    And When User Clicks The Login Button
    Then User Should See Success Message

TC_002 — Login With Wrong Password
    Given User Is On The Login Page
    When User Enters Invalid Password
    And When User Clicks The Login Button
    Then User Should Remain On Login Page
    And Then User Should See Invalid Password Error

TC_003 — Login With Wrong Username
    Given User Is On The Login Page
    When User Enters Invalid Username
    And When User Clicks The Login Button
    Then User Should Remain On Login Page
    And Then User Should See Invalid Username Error

TC_004 — Logout After Successful Login
    Given User Is On The Login Page
    When User Enters Valid Credentials
    And When User Clicks The Login Button
    And Then User Should See Success Message
    When User Clicks The Logout Button
    Then User Should Be Redirected To Login Page
    And Then User Should See Logout Confirmation Message