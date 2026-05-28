*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}         https://www.saucedemo.com
${BROWSER}          chrome
${LOCKED_USER}      locked_out_user
${STANDARD_USER}    standard_user
${PASSWORD}         secret_sauce
${USERNAME_FIELD}   id=user-name
${PASSWORD_FIELD}   id=password
${LOGIN_BUTTON}     id=login-button
${ERROR_MESSAGE}    css=.error-message-container h3
${SORT_DROPDOWN}    css=.product_sort_container
${CART_ICON}        css=.shopping_cart_link
${CART_BADGE}       css=.shopping_cart_badge
${CART_ITEM}        css=.cart_item
${REMOVE_BUTTON}    css=button[id^='remove']
${FIRST_PRODUCT_PRICE}    css=.inventory_item_price:first-of-type
${ALL_PRODUCT_PRICES}     css=.inventory_item_price
${ADD_TO_CART_BUTTON}     css=button[id^='add-to-cart']:first-of-type
${INVENTORY_PAGE_URL}     https://www.saucedemo.com/inventory.html
${CART_PAGE_URL}          https://www.saucedemo.com/cart.html
${LOCKED_ERROR_TEXT}      Epic sadface: Sorry, this user has been locked out.