*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Suite — SauceDemo
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Click Login Button
    Then Verify Products Page Is Shown

TC_002 — Add A Product To The Cart

    And Enter Valid Credentials
    And Click Login Button
    And Verify Products Page Is Shown
    When Add Product To Cart
    Then Verify Cart Badge Is One
    And Go To Cart Page
    And Verify Cart Has Product

TC_003 — Failed Login With Invalid Credentials

    When Enter Invalid Credentials
    And Click Login Button
    Then Verify Login Error Message
    And Verify User Remains On Login Page