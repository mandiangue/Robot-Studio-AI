*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for SauceDemo test suite

*** Variables ***
${BASE_URL}                 https://www.saucedemo.com
${BROWSER}                  chrome
${STANDARD_USER}            standard_user
${LOCKED_USER}              locked_out_user
${PASSWORD}                 secret_sauce
${INVENTORY_URL}            /inventory.html
${USERNAME_FIELD}           id=user-name
${PASSWORD_FIELD}           id=password
${LOGIN_BUTTON}             id=login-button
${ERROR_MESSAGE}            css=.error-message-container h3
${CART_BADGE}               css=.shopping_cart_badge
${INVENTORY_LIST}           css=.inventory_list
${FIRST_ADD_TO_CART}        css=.inventory_item:first-child button
${FIRST_REMOVE_BUTTON}      css=.inventory_item:first-child button
${LOCKED_ERROR_TEXT}        Epic sadface: Sorry, this user has been locked out.