*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests — Saucedemo Login and Cart scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Submit Login Form
    Then Verify Products Page Is Shown

TC_002 — Failed Login With Incorrect Password

    When Enter Invalid Password Credentials
    And Submit Login Form
    Then Verify Error Message Is Shown
    And Verify User Stays On Login Page

TC_003 — Add A Product To The Cart

    And Enter Valid Credentials
    And Submit Login Form
    And Verify Products Page Is Shown
    When Add First Product To Cart
    Then Verify Cart Badge Displays One
    And Verify First Item Button Is Remove