*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Variables for SauceDemo application tests

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${USERNAME_VALID}    standard_user
${PASSWORD_VALID}    secret_sauce
${LOGIN_USERNAME_FIELD}    id=user-name
${LOGIN_PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}    id=login-button
${PRODUCTS_CONTAINER}    class:inventory_container
${ADD_TO_CART_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${CART_BADGE}    class:shopping_cart_badge
${SORT_DROPDOWN}    class:product_sort_container
${SORT_PRICE_LOW_HIGH}    value:lohi
${PRODUCT_PRICE}    class:inventory_item_price