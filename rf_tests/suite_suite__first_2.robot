*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests — SauceDemo Login & Cart
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Fill In Credentials With Valid Data
    And Submit Login Form
    Then Products Page Is Displayed With Title

TC_002 — Failed Login With Incorrect Password

    When Fill In Credentials With Invalid Password
    And Submit Login Form
    Then An Error Message Is Shown For Invalid Credentials
    And User Remains On Login Page

TC_003 — Add A Product To The Cart

    And User Is Logged In Successfully
    When Add Sauce Labs Backpack To Cart
    Then Cart Badge Displays One Item