*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779534210190_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779534210190_1/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Is Redirected To Inventory Page
    And The Session Is Established Successfully

TC_002 Add Product To Cart

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Is Redirected To Inventory Page
    When User Selects The First Product
    And User Clicks Add To Cart Button
    Then The Product Is Added To Cart
    And The Cart Badge Displays Correct Item Count

TC_003 Complete Order Checkout

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Is Redirected To Inventory Page
    When User Selects The First Product
    And User Clicks Add To Cart Button
    When User Navigates To The Cart
    Then User Accesses The Checkout Page
    And User Fills In The Shipping Information
    And User Proceeds To Payment Review
    And User Completes The Order
    Then Order Is Completed Successfully
    And A Confirmation Page Displays With Order Number