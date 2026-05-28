*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}         https://www.saucedemo.com
${BROWSER}          chrome
${LOCKED_USER}      locked_out_user
${STANDARD_USER}    standard_user
${PASSWORD}         secret_sauce
${USERNAME_FIELD}   id=user-name
${PASSWORD_FIELD}   id=password
${LOGIN_BUTTON}     id=login-button
${ERROR_MSG}        css=[data-test="error"]
${CART_BADGE}       css=.shopping_cart_badge
${ADD_TO_CART_BTN}  css=[data-test="add-to-cart-sauce-labs-backpack"]
${REMOVE_BTN}       css=[data-test="remove-sauce-labs-backpack"]
${SORT_DROPDOWN}    css=.product_sort_container
${PRODUCT_PRICES}   css=.inventory_item_price
${LOCKED_ERROR}     Epic sadface: Sorry, this user has been locked out.
${SORT_LOHI}        lohi