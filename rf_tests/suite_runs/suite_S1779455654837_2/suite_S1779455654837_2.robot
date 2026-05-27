*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${USERNAME}    standard_user
${PASSWORD}    secret_sauce
${INVALID_USERNAME}    invalid_user
${INVALID_PASSWORD}    wrong_password
${PRODUCT_1}    Sauce Labs Backpack
${PRODUCT_2}    Sauce Labs Bike Light
${PRODUCT_3}    Sauce Labs Bolt T-Shirt
${LOGIN_BUTTON}    id=login-button
${USERNAME_FIELD}    id=user-name
${PASSWORD_FIELD}    id=password
${PRODUCTS_CONTAINER}    class:inventory_container
${ADD_TO_CART_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${CART_BADGE}    class:shopping_cart_badge
${CART_LINK}    class:shopping_cart_link
${CHECKOUT_BUTTON}    id=checkout
${FIRST_NAME_FIELD}    id=first-name
${LAST_NAME_FIELD}    id=last-name
${POSTAL_CODE_FIELD}    id=postal-code
${CONTINUE_BUTTON}    id=continue
${FINISH_BUTTON}    id=finish
${CONFIRMATION_MESSAGE}    class:complete-header
${ORDER_NUMBER}    class:complete-text
${SIDEBAR_MENU}    id=react-burger-menu-btn
${SIDEBAR}    class:bm-menu
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
Login With Valid Credentials And Verify Homepage
    Login With Valid Credentials
    Verify Successful Login
    Close Saucedemo Browser

Add Multiple Products To Cart And Verify Cart
    Login With Valid Credentials
    Verify Successful Login
    Add Multiple Products To Cart    3
    ${cart_count}    Get Cart Badge Count
    Should Be Equal    ${cart_count}    3
    Verify Cart Contains Products    3
    Close Saucedemo Browser

Complete Checkout Process And Verify Order Confirmation
    Login With Valid Credentials
    Verify Successful Login
    Add Multiple Products To Cart    2
    Verify Cart Contains Products    2
    Complete Checkout Process    John    Doe    12345
    Verify Order Is Confirmed
    Close Saucedemo Browser