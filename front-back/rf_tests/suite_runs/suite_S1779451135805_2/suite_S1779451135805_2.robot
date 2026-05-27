*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${BROWSER}    chrome
${STANDARD_USER}    standard_user
${PASSWORD}    secret_sauce
${INVALID_USER}    invalid_user
${INVALID_PASSWORD}    wrong_password
${LOGIN_INPUT_USERNAME}    id=user-name
${LOGIN_INPUT_PASSWORD}    id=password
${LOGIN_BUTTON}    id=login-button
${PRODUCTS_CONTAINER}    class=inventory_list
${PRODUCT_ITEM}    class=inventory_item
${ADD_TO_CART_BUTTON}    xpath=//button[contains(text(), 'Add to cart')]
${REMOVE_BUTTON}    xpath=//button[contains(text(), 'Remove')]
${CART_BADGE}    class=shopping_cart_badge
${CART_LINK}    class=shopping_cart_link
${CHECKOUT_BUTTON}    id=checkout
${FIRST_NAME_INPUT}    id=first-name
${LAST_NAME_INPUT}    id=last-name
${POSTAL_CODE_INPUT}    id=postal-code
${CONTINUE_BUTTON}    id=continue
${FINISH_BUTTON}    id=finish
${ERROR_MESSAGE}    class=error-message
${SORT_DROPDOWN}    class=product_sort_container
${SORT_PRICE_HIGH_TO_LOW}    xpath=//option[@value='hilo']
${PRODUCT_PRICE}    class=inventory_item_price
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test cases for Sauce Demo application
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials
    [Documentation]    User logs in with valid credentials and accesses product page
    [Tags]    login    smoke
    Open Login Page
    Login With Valid Credentials
    Verify User Is Successfully Logged In


TC_002 Add Product To Shopping Cart
    [Documentation]    User adds product to cart and verifies it appears with correct count
    [Tags]    cart    functionality
    Open Login Page
    Login With Valid Credentials
    Verify User Is Successfully Logged In
    Add Product To Cart
    Verify Product Added To Cart


TC_003 Validate Incomplete Checkout Form
    [Documentation]    User attempts checkout without filling required fields and receives error
    [Tags]    checkout    validation
    Open Login Page
    Login With Valid Credentials
    Verify User Is Successfully Logged In
    Add Product To Cart
    Proceed To Checkout
    Attempt Checkout Without Required Fields
    Verify Checkout Error Message


TC_004 Sort Products By Price Descending
    [Documentation]    User sorts products by price from high to low and verifies order
    [Tags]    sorting    functionality
    Open Login Page
    Login With Valid Credentials
    Verify User Is Successfully Logged In
    Sort Products By Price Descending
    Verify Products Are Sorted By Price Descending
