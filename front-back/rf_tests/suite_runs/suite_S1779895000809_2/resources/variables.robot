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
${ERROR_MESSAGE}    css=.error-message-container h3
${SORT_DROPDOWN}    css=.product_sort_container
${BURGER_MENU}      id=react-burger-menu-btn
${LOGOUT_LINK}      id=logout_sidebar_link
${PRODUCT_PRICES}   css=.inventory_item_price
${INVENTORY_URL}    https://www.saucedemo.com/inventory.html
${LOGIN_URL}        https://www.saucedemo.com