*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business Keywords for Test Scenarios
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540186522_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540186522_2/resources/pages/login_page.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540186522_2/resources/pages/main_page.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540186522_2/resources/pages/cart_page.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540186522_2/resources/pages/checkout_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Given User Opens Login Page
    Open Login Page

When User Enters Valid Credentials
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

When User Enters Invalid Credentials
    Enter Username    ${INVALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}

And User Clicks Login Button
    Click Login Button

Then User Should Be Redirected To Home Page
    Main Page Should Be Displayed

Then Error Message Should Be Displayed
    Error Message Should Be Visible
    ${error_text}=    Get Error Message
    Should Contain    ${error_text}    Epic sadface

When User Adds Product To Cart
    Add First Product To Cart

Then Product Should Be Added To Cart
    Cart Badge Should Show Count    1

And User Navigates To Cart
    Click Cart Link

And Cart Should Display The Product
    Cart Should Contain Product

And User Proceeds To Checkout
    Click Checkout Button

When User Fills Checkout Form
    Checkout Page Should Be Displayed
    Enter First Name    ${FIRST_NAME}
    Enter Last Name    ${LAST_NAME}
    Enter Postal Code    ${POSTAL_CODE}

And User Completes Checkout
    Click Continue Button
    Click Finish Button

Then Confirmation Message Should Be Displayed
    Confirmation Page Should Be Displayed