*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for SauceDemo test suite

*** Variables ***
${BASE_URL}           https://www.saucedemo.com
${BROWSER}            chrome
${VALID_USERNAME}     standard_user
${VALID_PASSWORD}     secret_sauce
${LOGIN_URL}          https://www.saucedemo.com
${INVENTORY_URL}      https://www.saucedemo.com/inventory.html
${CART_URL}           https://www.saucedemo.com/cart.html

# Login page selectors
${USERNAME_FIELD}     id=user-name
${PASSWORD_FIELD}     id=password
${LOGIN_BUTTON}       id=login-button
${LOGIN_LOGO}         css=.login_logo

# Inventory page selectors
${SORT_DROPDOWN}      css=select.product_sort_container
${PRODUCT_PRICES}     css=.inventory_item_price
${INVENTORY_ITEMS}    css=.inventory_item

# Cart selectors
${CART_ICON}          css=.shopping_cart_link
${CART_BADGE}         css=.shopping_cart_badge
${CART_ITEM}          css=.cart_item
${REMOVE_BUTTON}      css=.cart_item .btn_secondary
${ADD_TO_CART_FIRST}  css=.inventory_item:first-child button

# Burger menu selectors
${BURGER_MENU}        id=react-burger-menu-btn
${LOGOUT_LINK}        id=logout_sidebar_link
${SIDEBAR_MENU}       css=.bm-menu-wrap