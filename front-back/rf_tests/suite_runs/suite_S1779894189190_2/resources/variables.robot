*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}          https://www.saucedemo.com
${BROWSER}           chrome
${STANDARD_USER}     standard_user
${LOCKED_USER}       locked_out_user
${PASSWORD}          secret_sauce
${USERNAME_FIELD}    id=user-name
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}      id=login-button
${ERROR_MESSAGE}     css=.error-message-container h3
${SORT_DROPDOWN}     css=.product_sort_container
${PRODUCT_PRICES}    css=.inventory_item_price
${ADD_TO_CART_BTN}   css=.inventory_item button
${CART_ICON}         css=.shopping_cart_link
${CART_BADGE}        css=.shopping_cart_badge
${REMOVE_BUTTON}     css=.cart_item button
${CART_ITEMS}        css=.cart_item
${LOCKED_ERROR_MSG}    Epic sadface: Sorry, this user has been locked out.