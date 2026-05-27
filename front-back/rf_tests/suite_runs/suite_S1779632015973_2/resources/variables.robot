*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for SauceDemo test suite

*** Variables ***
${BASE_URL}           https://www.saucedemo.com
${BROWSER}            chrome
${USERNAME}           standard_user
${PASSWORD}           secret_sauce
${USERNAME_FIELD}     id=user-name
${PASSWORD_FIELD}     id=password
${LOGIN_BUTTON}       id=login-button
${PRODUCTS_TITLE}     css=.title
${ADD_TO_CART_BTN}    css=.inventory_list .inventory_item:first-child button
${CART_BADGE}         css=.shopping_cart_badge
${REMOVE_BTN}         css=.inventory_list .inventory_item:first-child button
${BURGER_MENU}        id=react-burger-menu-btn
${LOGOUT_LINK}        id=logout_sidebar_link
${LOGIN_CONTAINER}    id=login_button_container