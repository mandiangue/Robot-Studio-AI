*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for SauceDemo test suite

*** Variables ***
${BASE_URL}             https://www.saucedemo.com
${BROWSER}              chrome
${USERNAME}             standard_user
${PASSWORD}             secret_sauce
${TIMEOUT}              10s
# Login page selectors
${INPUT_USERNAME}       id=user-name
${INPUT_PASSWORD}       id=password
${BTN_LOGIN}            id=login-button
# Products page selectors
${CART_BADGE}           css=.shopping_cart_badge
${BTN_ADD_TO_CART}      css=[data-test="add-to-cart-sauce-labs-backpack"]
${BTN_REMOVE}           css=[data-test="remove-sauce-labs-backpack"]
${SORT_DROPDOWN}        css=.product_sort_container
${SORT_OPTION_LOW_HIGH}    Price (low to high)
${PRODUCT_PRICES}       css=.inventory_item_price
# Burger menu selectors
${BTN_BURGER_MENU}      id=react-burger-menu-btn
${LINK_LOGOUT}          id=logout_sidebar_link
# Login page verification selectors
${LOGIN_CONTAINER}      css=.login_container