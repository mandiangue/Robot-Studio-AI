*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for Saucedemo Application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779539673165_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779539673165_2/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials
    [Documentation]    User logs in with standard_user and secret_sauce credentials

    Given User Is On Login Page
    When User Enters Valid Credentials
    When User Clicks Login
    Then User Is Redirected To Products Page

TC_002 Add Product To Cart
    [Documentation]    User adds Sauce Labs Backpack to cart from products page

    When User Enters Valid Credentials
    When User Clicks Login
    When User Adds Backpack To Cart
    Then Cart Badge Displays One Item
    And User Navigates To Cart
    And Product Appears In Cart

TC_003 Complete Order With Shipping Information
    [Documentation]    User completes checkout with first name Jean, last name Dupont, postal code 75001

    When User Enters Valid Credentials
    When User Clicks Login
    When User Adds Backpack To Cart
    And User Navigates To Cart
    When User Proceeds To Checkout
    When User Fills Checkout Information With First Name And Last Name And Postal Code    Jean    Dupont    75001
    When User Clicks Continue On Checkout
    When User Clicks Finish Button
    Then User Sees Order Confirmation Message

TC_004 Logout From Application
    [Documentation]    User logs out using menu burger and logout option

    When User Enters Valid Credentials
    When User Clicks Login
    When User Clicks Menu Button
    When User Clicks Logout
    Then User Is Redirected To Login Page
    And User Can See Login Form