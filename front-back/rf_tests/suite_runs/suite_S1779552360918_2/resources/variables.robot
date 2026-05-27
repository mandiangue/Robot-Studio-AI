*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables globales pour les tests SauceDemo

*** Variables ***
${BASE_URL}                 https://www.saucedemo.com
${BROWSER}                  chrome
${VALID_USERNAME}           standard_user
${VALID_PASSWORD}           secret_sauce
${INVALID_USERNAME}         invalid_user
${INVALID_PASSWORD}         wrong_password
${INVENTORY_URL_PART}       /inventory.html
${INPUT_USERNAME}           id=user-name
${INPUT_PASSWORD}           id=password
${BTN_LOGIN}                id=login-button
${CART_BADGE}               css=.shopping_cart_badge
${FIRST_ADD_TO_CART_BTN}    css=.inventory_item:first-child button
${FIRST_REMOVE_BTN}         css=.inventory_item:first-child button
${INVENTORY_LIST}           css=.inventory_list
${ERROR_MESSAGE}            css=.error-message-container h3
${EXPECTED_ERROR_TEXT}      Epic sadface: Username and password do not match any user in this service