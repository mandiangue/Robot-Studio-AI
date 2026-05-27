*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login test suite for the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Submit Login Form
    Then Verify Successful Login

TC_002 — Failed Login With Incorrect Password

    When Enter Invalid Password Credentials
    And Submit Login Form
    Then Verify Failed Login With Password Error

TC_003 — Failed Login With Incorrect Username

    When Enter Invalid Username Credentials
    And Submit Login Form
    Then Verify Failed Login With Username Error



*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Submit Login Form
    Then Verify Successful Login

TC_002 — Failed Login With Incorrect Password

    When Enter Invalid Credentials With Wrong Password
    And Submit Login Form
    Then Verify Failed Login With Error Message
    And Verify User Is Still On Login Page

TC_003 — Add A Product To The Cart

    And Login With Valid Credentials
    When Add First Available Product To Cart
    Then Verify Cart Counter Is Incremented To One