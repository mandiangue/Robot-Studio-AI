*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}                https://www.saucedemo.com
${BROWSER}                 chrome
${USERNAME}                standard_user
${PASSWORD}                secret_sauce
${FIRST_NAME}              John
${LAST_NAME}               Doe
${POSTAL_CODE}             75001

# Selectors
${USERNAME_FIELD}          id=user-name
${PASSWORD_FIELD}          id=password
${LOGIN_BUTTON}            id=login-button
${PRODUCTS_CONTAINER}      class:inventory_container
${FIRST_PRODUCT_ADD_BUTTON}    xpath=//button[@data-test='add-to-cart-sauce-labs-backpack']
${CART_BADGE}              class:shopping_cart_badge
${CART_LINK}               id=shopping_cart_container
${CHECKOUT_BUTTON}         id=checkout
${FIRST_NAME_FIELD}        id=first-name
${LAST_NAME_FIELD}         id=last-name
${POSTAL_CODE_FIELD}       id=postal-code
${CONTINUE_BUTTON}         id=continue
${FINISH_BUTTON}           id=finish
${CONFIRMATION_MESSAGE}    class:complete-header
${HAMBURGER_MENU}          id=react-burger-menu-btn
${LOGOUT_OPTION}           id=logout_sidebar_link
${LOGIN_PAGE_CONTAINER}    class:login_container
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for SauceDemo Application
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials
    [Documentation]    User logs in with valid credentials and sees the products list
    [Tags]    login    sanity
    Open Saucedemo Application
    Login With Valid Credentials    ${USERNAME}    ${PASSWORD}
    Verify User Is On Products Page
    Close Saucedemo Application

TC_002 Add Product To Cart
    [Documentation]    After successful login, user adds the first product to the cart
    [Tags]    cart    functionality
    Open Saucedemo Application
    Login With Valid Credentials    ${USERNAME}    ${PASSWORD}
    Verify User Is On Products Page
    Add Product To Shopping Cart
    Verify Item Count In Cart
    Close Saucedemo Application

TC_003 Complete Checkout Process
    [Documentation]    User completes checkout with personal information and reaches order confirmation
    [Tags]    checkout    functionality
    Open Saucedemo Application
    Login With Valid Credentials    ${USERNAME}    ${PASSWORD}
    Verify User Is On Products Page
    Add Product To Shopping Cart
    Access Shopping Cart
    Complete Checkout Process    ${FIRST_NAME}    ${LAST_NAME}    ${POSTAL_CODE}
    Verify Order Confirmation Page
    Close Saucedemo Application

TC_004 Logout From Application
    [Documentation]    User logs out using the hamburger menu and is redirected to login page
    [Tags]    logout    sanity
    Open Saucedemo Application
    Login With Valid Credentials    ${USERNAME}    ${PASSWORD}
    Verify User Is On Products Page
    Logout From Application
    Verify User Is On Login Page
    Close Saucedemo Application