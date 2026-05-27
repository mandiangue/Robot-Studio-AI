*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Variables for SauceDemo Application Tests

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${VALID_USERNAME}    standard_user
${VALID_PASSWORD}    secret_sauce
${PRODUCT_NAME}    Sauce Labs Backpack
${FIRST_NAME}    John
${LAST_NAME}    Doe
${POSTAL_CODE}    75001
${LOGIN_PAGE_TITLE}    Swag Labs
${PRODUCTS_PAGE_TITLE}    Products
${CHECKOUT_PAGE_TITLE}    Checkout: Your Information
${CONFIRMATION_PAGE_TITLE}    Thank you for your order
${SELECTOR_USERNAME_INPUT}    id=user-name
${SELECTOR_PASSWORD_INPUT}    id=password
${SELECTOR_LOGIN_BUTTON}    id=login-button
${SELECTOR_PRODUCT_ADD_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${SELECTOR_CART_BADGE}    class:shopping_cart_badge
${SELECTOR_CART_LINK}    class:shopping_cart_link
${SELECTOR_CHECKOUT_BUTTON}    id=checkout
${SELECTOR_FIRST_NAME_INPUT}    id=first-name
${SELECTOR_LAST_NAME_INPUT}    id=last-name
${SELECTOR_POSTAL_CODE_INPUT}    id=postal-code
${SELECTOR_CONTINUE_BUTTON}    id=continue
${SELECTOR_FINISH_BUTTON}    id=finish
${SELECTOR_MENU_BUTTON}    id=react-burger-menu-btn
${SELECTOR_LOGOUT_LINK}    id=logout_sidebar_link
${SELECTOR_CONFIRMATION_MESSAGE}    xpath=//h2[contains(text(), 'Thank you')]