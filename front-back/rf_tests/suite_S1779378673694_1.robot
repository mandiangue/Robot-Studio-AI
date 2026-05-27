*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo — 3 test cases
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Fill In Login Form With Valid Credentials
    And Submit Login Form
    Then Products Page Is Displayed With Title And Items

TC_002 — Add A Product To The Cart

    And Fill In Login Form With Valid Credentials
    And Submit Login Form
    And Products Page Is Displayed With Title And Items
    When Add Backpack To Cart
    Then Cart Badge Displays One Item
    When Navigate To Cart Page
    Then Cart Contains Sauce Labs Backpack

TC_003 — Failed Login With Wrong Password

    When Fill In Login Form With Invalid Password
    And Submit Login Form
    Then Login Error Message Is Shown
    And User Remains On Login Page