*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for Saucedemo application

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${STANDARD_USER}    standard_user
${VALID_PASSWORD}    secret_sauce
${INVALID_USER}    invalid_user
${INVALID_PASSWORD}    wrongpassword
${LOGIN_USERNAME_INPUT}    id=user-name
${LOGIN_PASSWORD_INPUT}    id=password
${LOGIN_BUTTON}    id=login-button
${PRODUCTS_CONTAINER}    class:inventory_list
${FIRST_PRODUCT_ADD_BUTTON}    xpath=//button[contains(text(), 'Add to cart')][1]
${FIRST_PRODUCT_REMOVE_BUTTON}    xpath=//button[contains(text(), 'Remove')][1]
${CART_BADGE}    class:shopping_cart_badge
${ERROR_MESSAGE}    xpath=//h3[@data-test='error']
${SORT_DROPDOWN}    class:product_sort_container
${SORT_LOW_TO_HIGH}    xpath=//option[@value='lohi']
${INVENTORY_PAGE_INDICATOR}    class:inventory_container