*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation       Tests SauceDemo — Keyword-Driven
Library             SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780142606376_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780142606376_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Login With Locked User Account
    [Documentation]    Attempt login with locked_out_user and verify error message is displayed.
    Given Login With Locked User

TC_002 — Add Product To Cart From Product Detail Page
    [Documentation]    Login as standard_user, navigate to Sauce Labs Backpack detail page and add to cart.
    Given Login With Standard User
    When Add Backpack To Cart From Product Page

TC_003 — Sort Products By Price Low To High
    [Documentation]    Login as standard_user and sort products by price ascending, verify order.
    Given Login With Standard User
    When Sort Products By Price Low To High