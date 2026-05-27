*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for SauceDemo automation tests

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${VALID_USERNAME}    standard_user
${VALID_PASSWORD}    secret_sauce
${LOGIN_INPUT_USERNAME}    id=user-name
${LOGIN_INPUT_PASSWORD}    id=password
${LOGIN_BUTTON}    id=login-button
${PRODUCTS_CONTAINER}    class:inventory_list
${PRODUCT_ITEM}    class:inventory_item
${ADD_TO_CART_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${CART_BADGE}    class:shopping_cart_badge
${SORT_DROPDOWN}    class:product_sort_container