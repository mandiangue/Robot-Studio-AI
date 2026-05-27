*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}         https://www.saucedemo.com
${BROWSER}          chrome
${VALID_USER}       standard_user
${VALID_PASS}       secret_sauce
${WRONG_PASS}       mauvais_mot_de_passe
${USERNAME_FIELD}   id=user-name
${PASSWORD_FIELD}   id=password
${LOGIN_BUTTON}     id=login-button
${ERROR_MESSAGE}    css=.error-message-container h3
${INVENTORY_TITLE}  css=.title
${CART_BADGE}       css=.shopping_cart_badge
${ADD_TO_CART_BTN}  css=.inventory_item:first-child button
${REMOVE_BTN}       css=.inventory_item:first-child button