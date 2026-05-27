*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for SauceDemo Application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials
    [Documentation]    User logs in with valid username and password

    Login With Valid Credentials
    Verify User Is On Inventory Page


TC_002 Add Product To Cart
    [Documentation]    User adds a product to cart from inventory

    Login With Valid Credentials
    Verify User Is On Inventory Page
    Add Product To Cart From Inventory
    Verify Product Added To Cart    1


TC_003 Complete Checkout With Delivery Information
    [Documentation]    User completes checkout with delivery address

    Login With Valid Credentials
    Verify User Is On Inventory Page
    Add Product To Cart From Inventory
    Verify Product Added To Cart    1
    Proceed To Checkout
    Fill Delivery Information    John    Doe    75001
    Continue Checkout Process
    Verify Order Confirmation Page
    Complete Order


TC_004 Login With Invalid Credentials
    [Documentation]    User attempts login with invalid credentials

    Login With Invalid Credentials
    Verify Login Error Message Is Displayed
