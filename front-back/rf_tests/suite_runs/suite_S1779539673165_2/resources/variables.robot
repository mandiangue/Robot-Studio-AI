*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for Saucedemo Application

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${STANDARD_USER}    standard_user
${PASSWORD}    secret_sauce
${PRODUCTS_PAGE_TITLE}    Swag Labs
${LOGIN_BUTTON}    id=login-button
${USERNAME_FIELD}    id=user-name
${PASSWORD_FIELD}    id=password
${INVENTORY_CONTAINER}    class:inventory_container
${ADD_BACKPACK_BUTTON}    id=add-to-cart-sauce-labs-backpack
${CART_BADGE}    class:shopping_cart_badge
${CART_LINK}    class:shopping_cart_link
${CHECKOUT_BUTTON}    id=checkout
${FIRST_NAME_FIELD}    id=first-name
${LAST_NAME_FIELD}    id=last-name
${POSTAL_CODE_FIELD}    id=postal-code
${CONTINUE_BUTTON}    id=continue
${FINISH_BUTTON}    id=finish
${CONFIRMATION_MESSAGE}    class:complete-header
${MENU_BUTTON}    id=react-burger-menu-btn
${LOGOUT_OPTION}    id=logout_sidebar_link
${EXPECTED_CONFIRMATION_TEXT}    Thank you for your order