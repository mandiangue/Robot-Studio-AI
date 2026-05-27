*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779552902577_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779552902577_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page


Fill Login Form With Valid Credentials
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

Fill Login Form With Invalid Credentials
    Enter Username    ${INVALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}

Submit Login Form
    Click Login Button

Inventory Page Should Be Displayed
    Verify Inventory Page Is Displayed

Error Message Should Be Displayed
    Verify Error Message Is Displayed

User Should Stay On Login Page
    Verify User Stays On Login Page

Add First Product To Cart
    Click Add To Cart For First Product

Cart Badge Should Show One Item
    Verify Cart Badge Shows One

Product Button Should Show Remove
    Verify Remove Button Is Displayed

Close Test Browser