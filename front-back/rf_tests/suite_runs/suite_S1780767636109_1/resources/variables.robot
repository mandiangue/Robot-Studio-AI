*** Settings ***
Documentation    Variables for SauceDemo test suite
Library    SeleniumLibrary

*** Variables ***
${BASE_URL}           https://www.saucedemo.com
${BROWSER}            chrome
${USERNAME_GLITCH}    performance_glitch_user
${USERNAME_STD}       standard_user
${PASSWORD}           secret_sauce
${INVENTORY_URL}      https://www.saucedemo.com/inventory.html
${CART_URL}           https://www.saucedemo.com/cart.html
# Selectors — Login
${INPUT_USERNAME}     id=user-name
${INPUT_PASSWORD}     id=password
${BTN_LOGIN}          id=login-button
# Selectors — Inventory
${SORT_DROPDOWN}      css=.product_sort_container
${CART_BADGE}         css=.shopping_cart_badge
${CART_LINK}          css=.shopping_cart_link
# Selectors — Products
${BTN_ADD_BACKPACK}       id=add-to-cart-sauce-labs-backpack
${BTN_ADD_BIKE_LIGHT}     id=add-to-cart-sauce-labs-bike-light
${BTN_ADD_BOLT_SHIRT}     id=add-to-cart-sauce-labs-bolt-t-shirt
${BTN_ADD_FLEECE}         id=add-to-cart-sauce-labs-fleece-jacket
${BTN_REMOVE_BACKPACK}    id=remove-sauce-labs-backpack
${BTN_REMOVE_BIKE_LIGHT}  id=remove-sauce-labs-bike-light
# Selectors — Cart
${BTN_CHECKOUT}       id=checkout
# Selectors — Checkout
${INPUT_FIRSTNAME}    id=first-name
${INPUT_LASTNAME}     id=last-name
${INPUT_POSTAL}       id=postal-code
${BTN_CONTINUE}       id=continue
${BTN_FINISH}         id=finish
${LABEL_COMPLETE}     css=.complete-header
# Selectors — Menu
${BTN_HAMBURGER}      id=react-burger-menu-btn
${BTN_LOGOUT}         id=logout_sidebar_link
# Selectors — Product prices
${PRODUCT_PRICES}     css=.inventory_item_price