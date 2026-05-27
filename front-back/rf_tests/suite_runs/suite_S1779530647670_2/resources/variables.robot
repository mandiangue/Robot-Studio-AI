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
${LOGIN_BUTTON}    id=login-button
${USERNAME_FIELD}    id=user-name
${PASSWORD_FIELD}    id=password
${ERROR_MESSAGE}    xpath=//h3[@data-test='error']
${INVENTORY_CONTAINER}    class:inventory_container
${ADD_TO_CART_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${CART_BADGE}    class:shopping_cart_badge
${CART_ICON}    class:shopping_cart_link
${CHECKOUT_BUTTON}    id=checkout
${CONTINUE_BUTTON}    id=continue
${FINISH_BUTTON}    id=finish
${CONFIRMATION_MESSAGE}    class:complete-header
${ORDER_NUMBER}    class:complete-text
${FIRSTNAME_FIELD}    id=first-name
${LASTNAME_FIELD}    id=last-name
${POSTAL_CODE_FIELD}    id=postal-code
${BACK_HOME_BUTTON}    id=back-to-products