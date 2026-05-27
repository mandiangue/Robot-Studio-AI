*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}         https://www.saucedemo.com
${BROWSER}          chrome
${USERNAME}         standard_user
${PASSWORD}         secret_sauce
${LOGIN_URL}        ${BASE_URL}
${PRODUCTS_URL}     ${BASE_URL}/inventory.html
${CART_URL}         ${BASE_URL}/cart.html
${CHECKOUT_URL}     ${BASE_URL}/checkout-step-one.html

${USERNAME_FIELD}       id=user-name
${PASSWORD_FIELD}       id=password
${LOGIN_BUTTON}         id=login-button
${SORT_DROPDOWN}        css=.product_sort_container
${SORT_PRICE_LOW_HIGH}  option[value='lohi']
${ADD_TO_CART_BUTTON}   css=.btn_primary.btn_inventory
${CART_ICON}            css=.shopping_cart_link
${CART_BADGE}           css=.shopping_cart_badge
${REMOVE_BUTTON}        css=.btn_secondary.btn_inventory
${CART_ITEM}            css=.cart_item
${CHECKOUT_BUTTON}      id=checkout
${FIRST_NAME_FIELD}     id=first-name
${LAST_NAME_FIELD}      id=last-name
${POSTAL_CODE_FIELD}    id=postal-code
${CONTINUE_BUTTON}      id=continue
${FINISH_BUTTON}        id=finish
${CONFIRMATION_MSG}     css=.complete-header
${CONFIRMATION_TEXT}    Thank you for your order!
${FIRST_PRODUCT_PRICE}  css=.inventory_item_price:first-of-type
${ALL_PRICES}           css=.inventory_item_price