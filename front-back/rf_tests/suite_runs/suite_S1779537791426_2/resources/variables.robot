*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for SauceDemo automation

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${VALID_USERNAME}    standard_user
${VALID_PASSWORD}    secret_sauce
${INVALID_PASSWORD}    wrong_password
${LOGIN_USERNAME_FIELD}    id=user-name
${LOGIN_PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}    id=login-button
${ERROR_MESSAGE}    xpath=//h3[@data-test='error']
${PRODUCT_LIST}    xpath=//div[@class='inventory_list']
${ADD_TO_CART_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${CART_BADGE}    xpath=//span[@class='shopping_cart_badge']
${SORT_DROPDOWN}    xpath=//select[@class='product_sort_container']
${SORT_PRICE_LOW_TO_HIGH}    lohi
${PRODUCT_PRICE}    xpath=//div[@class='inventory_item_price']