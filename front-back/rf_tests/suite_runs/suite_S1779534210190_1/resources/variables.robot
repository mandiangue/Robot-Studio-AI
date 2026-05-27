*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${USERNAME}    standard_user
${PASSWORD}    secret_sauce
${INVALID_USERNAME}    invalid_user
${INVALID_PASSWORD}    wrong_password
${LOGIN_BUTTON}    id=login-button
${USERNAME_FIELD}    id=user-name
${PASSWORD_FIELD}    id=password
${INVENTORY_TITLE}    Products
${ADD_TO_CART_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${CART_BADGE}    class:shopping_cart_badge
${CART_LINK}    class:shopping_cart_link
${CHECKOUT_BUTTON}    id=checkout
${FIRST_NAME_FIELD}    id=first-name
${LAST_NAME_FIELD}    id=last-name
${POSTAL_CODE_FIELD}    id=postal-code
${CONTINUE_BUTTON}    id=continue
${FINISH_BUTTON}    id=finish
${ORDER_CONFIRMATION_TITLE}    Thank you for your order
${ORDER_NUMBER}    class:complete-header