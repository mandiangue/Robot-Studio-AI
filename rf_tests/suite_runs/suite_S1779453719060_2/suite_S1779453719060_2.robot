*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}                          https://www.saucedemo.com
${BROWSER}                           chrome
${VALID_USERNAME}                    standard_user
${VALID_PASSWORD}                    secret_sauce
${LOGIN_INPUT_USERNAME}              id=user-name
${LOGIN_INPUT_PASSWORD}              id=password
${LOGIN_BUTTON}                      id=login-button
${INVENTORY_CONTAINER}               class:inventory_container
${SIDEBAR_MENU_BUTTON}               id=react-burger-menu-btn
${LOGOUT_LINK}                       id=logout_sidebar_link
${CART_BADGE}                        class:shopping_cart_badge
${CART_ICON}                         class:shopping_cart_link
${PRODUCT_SORT_DROPDOWN}             class:product_sort_container
${SORT_PRICE_LOW_TO_HIGH}            value:lohi
${ADD_TO_CART_BUTTON}                xpath=//button[contains(text(), 'Add to cart')]
${FIRST_PRODUCT_NAME}                xpath=//div[@class='inventory_item'][1]//div[@class='inventory_item_name ']
${CART_ITEM}                         class:cart_item
${PRODUCT_PRICE}                     class:inventory_item_price
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for SauceDemo Application
Library          SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials And Verify Inventory Page
    [Documentation]    Test Case 001 - User logs in with valid credentials
    [Tags]    login    smoke
    Open Login Page
    Login With Valid Credentials
    Verify Login Success


TC_002 Add Product To Cart And Verify Cart Badge
    [Documentation]    Test Case 002 - User adds a product to the cart
    [Tags]    cart    smoke
    Open Login Page
    Login With Valid Credentials
    Add Product To Cart And Verify


TC_003 Sort Products By Price Ascending Order
    [Documentation]    Test Case 003 - User sorts products by price low to high
    [Tags]    sort    smoke
    Open Login Page
    Login With Valid Credentials
    Sort Products By Price Low To High


TC_004 Logout From Application Successfully
    [Documentation]    Test Case 004 - User logs out from the application
    [Tags]    logout    smoke
    Open Login Page
    Login With Valid Credentials
    Logout From Application
