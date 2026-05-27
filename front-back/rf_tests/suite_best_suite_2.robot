*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo — Login and Cart scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot
Test Teardown    Tear Down Test

*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Fill In Login Form With Valid Credentials
    And Submit Login Form
    Then Verify Successful Login And Products Page

TC_002 — Failed Login With Wrong Password

    When Fill In Login Form With Wrong Password
    And Submit Login Form
    Then Verify Failed Login With Error Message

TC_003 — Add A Product To The Cart

    And Fill In Login Form With Valid Credentials
    And Submit Login Form
    And Verify Successful Login And Products Page
    When Add First Product To Cart
    Then Verify Cart Has One Item And Button Changed