*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo — TC_001, TC_002, TC_003
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Fill In Valid Credentials
    And Submit Login Form
    Then Inventory Page Should Be Displayed

TC_002 — Add A Product To The Cart

    And Fill In Valid Credentials
    And Submit Login Form
    And Inventory Page Should Be Displayed
    When Add First Product To Cart
    Then First Product Button Should Be Remove
    And Cart Badge Should Show One Item

TC_003 — Failed Login With Invalid Credentials

    When Fill In Invalid Credentials
    And Submit Login Form
    Then Login Error Message Should Be Displayed