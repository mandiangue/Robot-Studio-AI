*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business Keywords - Keyword-Driven Approach
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

User Logs In With Valid Credentials
    Open Login Page
    Verify Login Page Is Displayed
    Input Username    ${VALID_USERNAME}
    Input Password    ${VALID_PASSWORD}
    Click Login Button
    Verify Products Page Is Displayed

User Selects And Adds Product To Cart
    Select Product By Name    ${PRODUCT_NAME}
    Click Add To Cart Button
    Verify Cart Badge Shows Correct Count    1

User Proceeds To Checkout
    Click Cart Link
    Verify Cart Page Is Displayed
    Click Checkout Button
    Verify Checkout Information Page Is Displayed

User Enters Delivery And Payment Information
    Input First Name    ${FIRST_NAME}
    Input Last Name    ${LAST_NAME}
    Input Postal Code    ${POSTAL_CODE}
    Click Continue Button
    Verify Checkout Overview Page Is Displayed

User Completes Order
    Click Finish Button
    Verify Order Confirmation Is Displayed

User Logs Out
    Click Menu Button
    Click Logout Link
    Verify User Is Back On Login Page