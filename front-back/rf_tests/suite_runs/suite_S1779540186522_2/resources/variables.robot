*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for Sauce Demo Application Tests

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${VALID_USERNAME}    standard_user
${VALID_PASSWORD}    password123
${INVALID_USERNAME}    invalid_user
${INVALID_PASSWORD}    wrong_password
${FIRST_NAME}    John
${LAST_NAME}    Doe
${POSTAL_CODE}    12345

# Selectors - Login Page
${USERNAME_INPUT}    id=user-name
${PASSWORD_INPUT}    id=password
${LOGIN_BUTTON}    id=login-button
${ERROR_MESSAGE}    xpath=//h3[@data-test='error']

# Selectors - Main Page
${PRODUCT_LIST}    xpath=//div[@class='inventory_list']
${PRODUCT_ITEM}    xpath=//div[@class='inventory_item'][1]
${ADD_TO_CART_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${CART_BADGE}    xpath=//span[@class='shopping_cart_badge']
${CART_LINK}    xpath=//a[@class='shopping_cart_link']

# Selectors - Cart Page
${CART_ITEM}    xpath=//div[@class='cart_item']
${CHECKOUT_BUTTON}    id=checkout

# Selectors - Checkout Page
${FIRST_NAME_INPUT}    id=first-name
${LAST_NAME_INPUT}    id=last-name
${POSTAL_CODE_INPUT}    id=postal-code
${CONTINUE_BUTTON}    id=continue
${FINISH_BUTTON}    id=finish

# Selectors - Confirmation Page
${CONFIRMATION_MESSAGE}    xpath=//h2[@class='complete-header']