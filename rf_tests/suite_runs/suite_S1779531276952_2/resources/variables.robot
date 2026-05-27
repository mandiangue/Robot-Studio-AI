*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Variables for Saucedemo Application

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${USERNAME}    standard_user
${PASSWORD}    secret_sauce
${LOGIN_INPUT_USERNAME}    id=user-name
${LOGIN_INPUT_PASSWORD}    id=password
${LOGIN_BUTTON}    id=login-button
${PRODUCTS_CONTAINER}    class=inventory_list
${ADD_TO_CART_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${CART_BADGE}    class=shopping_cart_badge
${CART_LINK}    class=shopping_cart_link
${PRODUCT_SORT_DROPDOWN}    class=product_sort_container
${SORT_OPTION_PRICE_LOW_TO_HIGH}    xpath=//option[@value='lohi']
${PRODUCT_PRICE}    class=inventory_item_price
${PRODUCT_NAME}    class=inventory_item_name
${WELCOME_MESSAGE}    xpath=//span[contains(text(), 'Products')]