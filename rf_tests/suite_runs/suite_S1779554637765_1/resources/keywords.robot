*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for SauceDemo test suite — BDD style
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779554637765_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779554637765_1/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page


Fill In Login Form With Valid Credentials
    Enter Username    ${STANDARD_USER}
    Enter Password    ${PASSWORD}

Fill In Login Form With Locked User Credentials
    Enter Username    ${LOCKED_USER}
    Enter Password    ${PASSWORD}

Submit Login Form
    Click Login Button

Inventory Page Should Be Displayed
    Verify Inventory Page Is Displayed

Add First Product To Cart
    Click Add To Cart For First Product

Cart Badge Should Display One Item
    Verify Cart Badge Shows    1

First Product Button Should Be Remove
    Verify First Product Button Text    Remove

Locked Out Error Message Should Be Displayed
    Verify Error Message Is Displayed    ${LOCKED_ERROR_TEXT}

User Should Stay On Login Page
    Verify User Stays On Login Page

Close Browser Session
    Close Test Browser