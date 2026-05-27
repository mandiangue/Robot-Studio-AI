*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for Sauce Demo application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779640087709_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779640087709_2/resources/keywords.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779640087709_2/resources/pages/main_page.robot

*** Test Cases ***
TC_SAUCE_001 Login With Valid Credentials
    [Documentation]    User logs in with valid credentials and is redirected to products page
    [Tags]    login    smoke
    Open Main Page
    User Logs In With Valid Credentials
    User Is Successfully Authenticated
    Close Main Page

TC_SAUCE_002 Add Product To Cart
    [Documentation]    User adds a product to cart and verifies it appears with correct quantity
    [Tags]    cart    shopping
    Open Main Page
    User Logs In With Valid Credentials
    User Adds Product To Cart By Name    ${PRODUCT_NAME}
    Product Is Added To Cart Successfully    1
    Close Main Page

TC_SAUCE_003 Sort Products By Price Ascending
    [Documentation]    User sorts products by price in ascending order
    [Tags]    sorting    products
    Open Main Page
    User Logs In With Valid Credentials
    User Sorts Products By Price Ascending
    Products Are Displayed In Ascending Price Order
    Close Main Page