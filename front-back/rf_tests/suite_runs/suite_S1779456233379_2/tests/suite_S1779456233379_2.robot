*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for SauceDemo Application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials
    [Documentation]    User connects to saucedemo.com with valid username and password and is redirected to home page with product list
    User Logs In With Valid Credentials


TC_002 Add Product To Cart
    [Documentation]    User selects a product from the list and clicks Add to cart button - product is added and cart badge shows correct count
    User Logs In With Valid Credentials
    User Selects And Adds Product To Cart


TC_003 Complete Checkout Process
    [Documentation]    User accesses cart, enters delivery and payment information, validates order and receives confirmation message
    User Logs In With Valid Credentials
    User Selects And Adds Product To Cart
    User Proceeds To Checkout
    User Enters Delivery And Payment Information
    User Completes Order


TC_004 Logout From Application
    [Documentation]    User clicks burger menu and selects logout option and is redirected to login page unable to access protected pages
    User Logs In With Valid Credentials
    User Logs Out