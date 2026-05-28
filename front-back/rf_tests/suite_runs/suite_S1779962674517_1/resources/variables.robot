*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}         https://www.saucedemo.com
${BROWSER}          chrome
${VALID_USER}       standard_user
${VALID_PASS}       secret_sauce
${INVALID_USER}     wrong_user
${INVALID_PASS}     wrong_pass
${USERNAME_FIELD}   id=user-name
${PASSWORD_FIELD}   id=password
${LOGIN_BUTTON}     id=login-button
${ERROR_MESSAGE}    css=.error-message-container h3
${INVENTORY_LIST}   css=.inventory_list
${CART_BADGE}       css=.shopping_cart_badge
${ADD_TO_CART_BTN}  css=.inventory_item:first-child button
${REMOVE_BTN}       css=.inventory_item:first-child button
${SORT_DROPDOWN}    css=.product_sort_container
${SORT_LOW_HIGH}    lohi
${PRODUCT_PRICES}   css=.inventory_item_price