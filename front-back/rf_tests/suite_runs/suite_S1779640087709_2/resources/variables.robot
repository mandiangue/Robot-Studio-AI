*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for Sauce Demo automation tests

*** Variables ***
${BASE_URL}                https://www.saucedemo.com
${BROWSER}                 chrome
${VALID_USERNAME}          standard_user
${VALID_PASSWORD}          secret_sauce
${LOGIN_INPUT_USERNAME}    id=user-name
${LOGIN_INPUT_PASSWORD}    id=password
${LOGIN_BUTTON}            id=login-button
${PRODUCTS_CONTAINER}      class:inventory_container
${PRODUCT_NAME}            Sauce Labs Backpack
${ADD_TO_CART_BUTTON}      xpath=//button[contains(text(), 'Add to cart')]
${CART_BADGE}              class:shopping_cart_badge
${CART_LINK}               class:shopping_cart_link
${SORT_DROPDOWN}           class:product_sort_container
${SORT_PRICE_ASC}          value:price-asc