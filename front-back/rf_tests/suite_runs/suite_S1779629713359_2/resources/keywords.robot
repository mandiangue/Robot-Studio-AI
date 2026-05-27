*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords — BDD style, all names in English
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629713359_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629713359_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page


Enter Locked Out User Credentials And Submit
    Fill Login Form    ${LOCKED_USER}    ${PASSWORD}

Verify Locked Out Error Message Is Shown
    Verify Locked Out Error Is Displayed

Enter Standard User Credentials And Submit
    Fill Login Form    ${STANDARD_USER}    ${PASSWORD}

Verify Products Page Is Displayed
    Verify User Is On Products Page

Apply Sort By Price Low To High
    Sort Products By Price Low To High

Verify Products Are Sorted From Lowest To Highest Price
    Verify Products Are Sorted By Price Ascending

Add A Product To The Cart
    Add First Product To Cart

Navigate To Cart Page
    Go To Cart

Proceed To Checkout
    Click Checkout

Fill In Shipping Information
    Fill Shipping Information    ${FIRST_NAME}    ${LAST_NAME}    ${POSTAL_CODE}

Finish And Confirm The Order
    Confirm Order

Verify Order Confirmation Message Is Displayed
    Verify Order Confirmation Is Displayed

Close The Browser
    Close Test Browser