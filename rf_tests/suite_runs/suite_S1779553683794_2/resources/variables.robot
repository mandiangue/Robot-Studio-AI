*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for SauceDemo test suite

*** Variables ***
${BASE_URL}           https://www.saucedemo.com
${BROWSER}            chrome
${VALID_USERNAME}     standard_user
${VALID_PASSWORD}     secret_sauce
${WRONG_PASSWORD}     wrong_password
${LOGIN_BUTTON}       id=login-button
${USERNAME_FIELD}     id=user-name
${PASSWORD_FIELD}     id=password
${PRODUCTS_TITLE}     css=.title
${CART_BADGE}         css=.shopping_cart_badge
${FIRST_ADD_BUTTON}   css=.inventory_item:first-child button
${ERROR_MESSAGE}      css=[data-test="error"]