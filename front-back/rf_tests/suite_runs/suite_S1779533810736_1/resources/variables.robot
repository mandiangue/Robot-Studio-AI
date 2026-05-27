*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Variables for SauceDemo automation tests

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${VALID_USERNAME}    standard_user
${VALID_PASSWORD}    secret_sauce
${INVALID_USERNAME}    invalid_user
${INVALID_PASSWORD}    wrong_password
${FIRST_NAME}    John
${LAST_NAME}    Doe
${POSTAL_CODE}    75001
${LOGIN_BUTTON}    id=login-button
${USERNAME_INPUT}    id=user-name
${PASSWORD_INPUT}    id=password
${ERROR_MESSAGE}    xpath=//h3[@data-test='error']
${PRODUCT_ADD_BUTTON_1}    id=add-to-cart-sauce-labs-backpack
${PRODUCT_ADD_BUTTON_2}    id=add-to-cart-sauce-labs-bike-light
${CART_ICON}    xpath=//a[@class='shopping_cart_link']
${CART_BADGE}    xpath=//span[@class='shopping_cart_badge']
${CHECKOUT_BUTTON}    id=checkout
${FIRST_NAME_INPUT}    id=first-name
${LAST_NAME_INPUT}    id=last-name
${POSTAL_CODE_INPUT}    id=postal-code
${CONTINUE_BUTTON}    id=continue
${FINISH_BUTTON}    id=finish
${INVENTORY_CONTAINER}    xpath=//div[@class='inventory_list']
${CONFIRMATION_MESSAGE}    xpath=//h2[@class='complete-header']