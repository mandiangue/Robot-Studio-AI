*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${STANDARD_USER}    standard_user
${VALID_PASSWORD}    secret_sauce
${INVALID_PASSWORD}    wrong_password
${LOGIN_BUTTON}    id=login-button
${USERNAME_INPUT}    id=user-name
${PASSWORD_INPUT}    id=password
${ERROR_MESSAGE}    xpath=//h3[@data-test='error']
${INVENTORY_CONTAINER}    class:inventory_container
${ADD_TO_CART_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${REMOVE_BUTTON}    xpath=//button[contains(text(), 'Remove')]
${CART_BADGE}    class:shopping_cart_badge
${PRODUCT_SORT_DROPDOWN}    class:product_sort_container
${SORT_PRICE_LOW_TO_HIGH}    xpath=//option[@value='lohi']
${PRODUCT_PRICE}    class:inventory_item_price
${FIRST_PRODUCT_NAME}    xpath=(//div[@class='inventory_item_name'])[1]
${FIRST_ADD_TO_CART_BTN}    xpath=(//button[contains(text(), 'Add to cart')])[1]
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for Sauce Demo Application
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot



*** Test Cases ***
TC_001 Valid Authentication With Correct Credentials

    When User Enters Valid Username And Password
    And User Clicks Login Button
    Then User Should Be Redirected To Inventory Page
    And Product List Should Be Displayed Correctly

TC_002 Add Product To Cart

    When User Enters Valid Username And Password
    And User Clicks Login Button
    Then User Should Be Redirected To Inventory Page
    When User Adds First Product To Cart
    Then Product Should Be Added To Cart Successfully
    And Cart Badge Should Display Count Of One

TC_003 Failed Authentication With Incorrect Password

    When User Enters Username With Invalid Password
    And User Clicks Login Button
    Then Error Message Should Be Displayed
    And Error Message Should Contain Invalid Credentials Text
    And User Should Remain On Login Page

TC_004 Sort Products By Price Low To High

    When User Enters Valid Username And Password
    And User Clicks Login Button
    Then User Should Be Redirected To Inventory Page
    When User Selects Price Low To High Sort Option
    Then Products Should Be Sorted By Price In Ascending Order