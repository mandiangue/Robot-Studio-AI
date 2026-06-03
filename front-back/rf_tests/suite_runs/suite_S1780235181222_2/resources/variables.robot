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
${ERROR_MESSAGE}    css=.error-message-container h3
${SORT_DROPDOWN}    css=.product_sort_container
${CART_ICON}        css=.shopping_cart_link
${CART_BADGE}       css=.shopping_cart_badge
${CART_LIST}        css=.cart_list
${ADD_TO_CART_BTN}  css=.inventory_item:first-child button
${REMOVE_BTN}       css=.cart_item button
${LOCKED_ERROR}     Epic sadface: Sorry, this user has been locked out.
${SORT_PRICE_ASC}   lohi