*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${VALID_USERNAME}    standard_user
${VALID_PASSWORD}    secret_sauce
${INVALID_PASSWORD}    wrong_password
${LOGIN_BUTTON}    id=login-button
${USERNAME_FIELD}    id=user-name
${PASSWORD_FIELD}    id=password
${ERROR_MESSAGE}    xpath=//h3[@data-test='error']
${INVENTORY_CONTAINER}    class:inventory_container
${ADD_TO_CART_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${CART_BADGE}    class:shopping_cart_badge
${CART_LINK}    class:shopping_cart_link
${CHECKOUT_BUTTON}    id=checkout
${FIRST_NAME_FIELD}    id=first-name
${LAST_NAME_FIELD}    id=last-name
${POSTAL_CODE_FIELD}    id=postal-code
${CONTINUE_BUTTON}    id=continue
${FINISH_BUTTON}    id=finish
${CONFIRMATION_MESSAGE}    xpath=//h2[@class='complete-header']
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test cases for Saucedemo application
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials
    [Documentation]    User logs in with valid username and password and sees product list
    Given User Logs In With Valid Credentials
    Then User Can See Products List

TC_002 Add Product To Cart
    [Documentation]    User adds a product to cart and verifies cart count is updated
    Given User Logs In With Valid Credentials
    When User Adds Product To Cart
    Then User Verifies Cart Item Count Updated

TC_003 Complete Payment Process
    [Documentation]    User fills payment form and completes order successfully
    Given User Logs In With Valid Credentials
    And User Adds Product To Cart
    When User Proceeds To Checkout
    And User Completes Payment Process
    Then User Verifies Order Confirmation

TC_004 Login With Invalid Credentials
    [Documentation]    User attempts login with incorrect password and sees error message
    Given User Logs In With Invalid Credentials
    Then User Sees Login Error