*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for Sauce Demo automation tests

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${LOGIN_USERNAME_INPUT}    id=user-name
${LOGIN_PASSWORD_INPUT}    id=password
${LOGIN_BUTTON}    id=login-button
${PRODUCT_LIST}    class:inventory_list
${ADD_TO_CART_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${CART_BADGE}    class:shopping_cart_badge
${CART_LINK}    class:shopping_cart_link
${CHECKOUT_BUTTON}    id=checkout
${FIRST_NAME_INPUT}    id=first-name
${LAST_NAME_INPUT}    id=last-name
${POSTAL_CODE_INPUT}    id=postal-code
${CONTINUE_BUTTON}    id=continue
${FINISH_BUTTON}    id=finish
${CONFIRMATION_MESSAGE}    class:complete-header
${VALID_USERNAME}    standard_user
${VALID_PASSWORD}    secret_sauce
${PRODUCT_PRICE}    class:inventory_item_price
${PRODUCT_NAME}    class:inventory_item_name