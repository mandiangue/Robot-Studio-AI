*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}         https://www.saucedemo.com
${BROWSER}          chrome
${VALID_USER}       standard_user
${VALID_PASSWORD}   secret_sauce
${SORT_PRICE_LOW}   lohi
${PRODUCT_NAME}     Sauce Labs Backpack
${SORT_DROPDOWN}    css=[data-test="product-sort-container"]
${CART_ICON}        css=[data-icon="shopping-cart"]
${CART_BADGE}       css=.shopping_cart_badge
${CART_LINK}        css=.shopping_cart_link
${REMOVE_BUTTON}    css=.cart_item .btn_secondary
${BURGER_MENU}      id=react-burger-menu-btn
${LOGOUT_LINK}      id=logout_sidebar_link
${USERNAME_FIELD}   id=user-name
${PASSWORD_FIELD}   id=password
${LOGIN_BUTTON}     id=login-button
${INVENTORY_URL}    https://www.saucedemo.com/inventory.html
${CART_URL}         https://www.saucedemo.com/cart.html
${LOGIN_URL}        https://www.saucedemo.com/