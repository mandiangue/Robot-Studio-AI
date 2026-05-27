*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}         https://www.saucedemo.com
${BROWSER}          chrome
${VALID_USER}       standard_user
${LOCKED_USER}      locked_out_user
${PASSWORD}         secret_sauce
${USERNAME_FIELD}   id=user-name
${PASSWORD_FIELD}   id=password
${LOGIN_BUTTON}     id=login-button
${ERROR_MESSAGE}    css=[data-test="error"]
${CART_BADGE}       css=.shopping_cart_badge
${SORT_DROPDOWN}    css=.product_sort_container
${ADD_TO_CART_BTN}  css=.inventory_item:first-child button
${REMOVE_BTN_TEXT}  Remove
${PRODUCT_PRICES}   css=.inventory_item_price