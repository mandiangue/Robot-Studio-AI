*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}           https://www.saucedemo.com
${BROWSER}            chrome
${VALID_USERNAME}     standard_user
${VALID_PASSWORD}     secret_sauce
${INVALID_USERNAME}   wrong_user
${INVALID_PASSWORD}   wrong_pass
${USERNAME_FIELD}     id=user-name
${PASSWORD_FIELD}     id=password
${LOGIN_BUTTON}       id=login-button
${ERROR_MESSAGE}      css=.error-message-container h3
${INVENTORY_TITLE}    css=.title
${ADD_TO_CART_BTN}    css=.inventory_item:first-child button
${REMOVE_BTN}         css=.inventory_item:first-child button
${CART_BADGE}         css=.shopping_cart_badge