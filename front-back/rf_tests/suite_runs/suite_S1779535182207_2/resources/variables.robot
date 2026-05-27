*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Variables for SauceDemo application

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${STANDARD_USER}    standard_user
${PASSWORD}    secret_sauce
${INVALID_USER}    invalid_user
${INVALID_PASSWORD}    wrong_password
${LOGIN_INPUT_USERNAME}    id=user-name
${LOGIN_INPUT_PASSWORD}    id=password
${LOGIN_BUTTON}    id=login-button
${PRODUCTS_TITLE}    xpath=//span[@class='title' and text()='Products']
${ADD_TO_CART_BACKPACK}    id=add-to-cart-sauce-labs-backpack
${REMOVE_BUTTON}    id=remove-sauce-labs-backpack
${CART_BADGE}    xpath=//span[@class='shopping_cart_badge']
${CART_ICON}    xpath=//a[@class='shopping_cart_link']
${CART_ITEM}    xpath=//div[@class='cart_item']
${PRODUCT_NAME_IN_CART}    xpath=//div[@class='inventory_item_name']
${PRODUCT_PRICE_IN_CART}    xpath=//div[@class='inventory_item_price']
${CHECKOUT_BUTTON}    id=checkout
${ERROR_MESSAGE}    xpath=//h3[@data-test='error']
${EXPECTED_ERROR_TEXT}    Epic sadface: Username and password do not match any user in this service