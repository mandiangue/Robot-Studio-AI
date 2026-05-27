*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${VALID_USERNAME}    standard_user
${VALID_PASSWORD}    password123
${PRODUCT_1_BUTTON}    xpath=//button[@data-test='add-to-cart-sauce-labs-backpack']
${PRODUCT_2_BUTTON}    xpath=//button[@data-test='add-to-cart-sauce-labs-bike-light']
${CART_BADGE}    xpath=//span[@class='shopping_cart_badge']
${CART_LINK}    xpath=//a[@class='shopping_cart_link']
${CHECKOUT_BUTTON}    xpath=//button[@data-test='checkout']
${FINISH_BUTTON}    xpath=//button[@data-test='finish']
${INVENTORY_CONTAINER}    xpath=//div[@class='inventory_list']
${USERNAME_INPUT}    xpath=//input[@data-test='username']
${PASSWORD_INPUT}    xpath=//input[@data-test='password']
${LOGIN_BUTTON}    xpath=//input[@data-test='login-button']
${FIRST_NAME_INPUT}    xpath=//input[@data-test='firstName']
${LAST_NAME_INPUT}    xpath=//input[@data-test='lastName']
${POSTAL_CODE_INPUT}    xpath=//input[@data-test='postalCode']
${CONTINUE_BUTTON}    xpath=//input[@data-test='continue']
${CHECKOUT_SUMMARY}    xpath=//div[@class='checkout_summary_container']
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for Saucedemo Application
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials
    [Documentation]    User connects to saucedemo.com with valid username and password and is redirected to inventory page
    User Connects With Valid Credentials
    Verify Inventory Page Is Displayed


TC_002 Add Articles To Cart
    [Documentation]    User adds 2 articles to cart and verifies cart badge and content
    User Connects With Valid Credentials
    User Adds Two Products To Cart
    User Navigates To Cart And Verifies Content


TC_003 Validate Checkout Process
    [Documentation]    User completes checkout with billing information and validates order
    User Connects With Valid Credentials
    User Adds Two Products To Cart
    User Completes Checkout With Billing Information
    User Finalizes Purchase
