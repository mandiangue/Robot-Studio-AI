*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}           https://www.saucedemo.com
${BROWSER}            chrome
${VALID_USERNAME}     standard_user
${VALID_PASSWORD}     secret_sauce
${INVALID_USERNAME}   wrong_user
${INVALID_PASSWORD}   wrong_password
${LOGIN_USERNAME_FIELD}      id=user-name
${LOGIN_PASSWORD_FIELD}      id=password
${LOGIN_BUTTON}              id=login-button
${ERROR_MESSAGE}             css=[data-test="error"]
${PRODUCTS_TITLE}            css=.title
${ADD_TO_CART_BUTTON}        css=.inventory_item:first-child button
${CART_ICON}                 css=.shopping_cart_link
${CART_BADGE}                css=.shopping_cart_badge
${CART_ITEM_NAME}            css=.cart_item .inventory_item_name
${CART_ITEM_DESC}            css=.cart_item .inventory_item_desc
${CART_ITEM_PRICE}           css=.cart_item .inventory_item_price
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo application
Library          SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    [Documentation]    Verify that a user can log in successfully with valid credentials and is redirected to the products page

    When Enter Valid Credentials
    And Submit Login Form
    Then Verify Successful Login

TC_002 — Failed Login With Invalid Credentials
    [Documentation]    Verify that an error message is displayed when logging in with invalid credentials and user stays on login page

    When Enter Invalid Credentials
    And Submit Login Form
    Then Verify Failed Login With Error Message

TC_003 — Add Product To Cart And Verify
    [Documentation]    Verify that a product can be added to the cart and appears correctly on the cart page with badge count of 1

    And Enter Valid Credentials
    And Submit Login Form
    And Verify Successful Login
    When Add First Available Product To Cart
    Then Verify Cart Badge Displays One

    Then Verify Cart Contains Added Product