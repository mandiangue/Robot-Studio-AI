*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests — saucedemo BDD scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Submit Login Form
    Then Products Page Is Displayed

TC_002 — Add A Product To The Cart

    And Enter Valid Credentials
    And Submit Login Form
    And Products Page Is Displayed
    When Add Sauce Labs Backpack To Cart
    Then Cart Badge Displays One Item

    Then Cart Contains Sauce Labs Backpack With Quantity One

TC_003 — Failed Login With Invalid Credentials

    When Enter Invalid Credentials
    And Submit Login Form
    Then Error Message Is Shown For Invalid Credentials
    And User Remains On Login Page