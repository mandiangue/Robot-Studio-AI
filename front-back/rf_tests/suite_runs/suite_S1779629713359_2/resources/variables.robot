*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for SauceDemo test suite

*** Variables ***
${BASE_URL}             https://www.saucedemo.com
${BROWSER}              chrome
${LOCKED_USER}          locked_out_user
${STANDARD_USER}        standard_user
${PASSWORD}             secret_sauce
${FIRST_NAME}           John
${LAST_NAME}            Doe
${POSTAL_CODE}          75000
# Selectors — Login Page
${USERNAME_FIELD}       id=user-name
${PASSWORD_FIELD}       id=password
${LOGIN_BUTTON}         id=login-button
${ERROR_MESSAGE}        css=[data-test="error"]
# Selectors — Products Page
${SORT_DROPDOWN}        css=[data-test="product-sort-container"]
${PRODUCT_PRICES}       css=.inventory_item_price
${ADD_TO_CART_FIRST}    css=.inventory_item:first-child button
# Selectors — Cart
${CART_ICON}            id=shopping_cart_container
${CHECKOUT_BUTTON}      id=checkout
# Selectors — Checkout Step One
${FIRSTNAME_FIELD}      id=first-name
${LASTNAME_FIELD}       id=last-name
${POSTALCODE_FIELD}     id=postal-code
${CONTINUE_BUTTON}      id=continue
# Selectors — Checkout Step Two
${FINISH_BUTTON}        id=finish
# Selectors — Confirmation
${CONFIRM_HEADER}       css=.complete-header