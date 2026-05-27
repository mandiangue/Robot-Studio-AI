*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business Keywords
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779539673165_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779539673165_2/resources/pages/login_page.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779539673165_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Given User Opens Saucedemo Application
    Open Login Page

Given User Is On Login Page
    Verify Login Page Is Displayed

When User Enters Valid Credentials
    Enter Username    ${STANDARD_USER}
    Enter Password    ${PASSWORD}

When User Clicks Login
    Click Login Button

Then User Is Redirected To Products Page
    Wait Until Page Contains Element    ${INVENTORY_CONTAINER}    timeout=10s
    Verify Products Are Displayed

When User Adds Backpack To Cart
    Add Product To Cart    ${ADD_BACKPACK_BUTTON}

Then Cart Badge Displays One Item
    Verify Cart Badge Shows Count    1

And User Navigates To Cart
    Click Cart Link

And Product Appears In Cart
    Verify Product In Cart    Sauce Labs Backpack

When User Proceeds To Checkout
    Click Checkout Button

When User Fills Checkout Information With First Name And Last Name And Postal Code
    [Arguments]    ${first_name}    ${last_name}    ${postal_code}
    Fill Checkout Form    ${first_name}    ${last_name}    ${postal_code}

When User Clicks Continue On Checkout
    Click Continue Button

When User Clicks Finish Button
    Click Finish Button

Then User Sees Order Confirmation Message
    Verify Order Confirmation

When User Clicks Menu Button
    Open Menu

When User Clicks Logout
    Click Logout Option

Then User Is Redirected To Login Page
    Verify Login Page Is Displayed

And User Can See Login Form
    Page Should Contain Element    ${LOGIN_BUTTON}
    Page Should Contain Element    ${USERNAME_FIELD}
    Page Should Contain Element    ${PASSWORD_FIELD}