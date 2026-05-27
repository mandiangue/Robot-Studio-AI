*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier BDD — SauceDemo
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779552360918_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779552360918_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page


Enter Valid Credentials
    Fill Username    ${VALID_USERNAME}
    Fill Password    ${VALID_PASSWORD}

Enter Invalid Credentials
    Fill Username    ${INVALID_USERNAME}
    Fill Password    ${INVALID_PASSWORD}

Submit Login Form
    Click Login Button

Inventory Page Should Be Displayed
    Verify Inventory Page Is Displayed

Add First Product To Cart
    Click Add To Cart For First Product

Cart Badge Should Show One
    Verify Cart Badge Shows One

First Product Button Should Be Remove
    Verify First Product Button Is Remove

Login Error Should Be Displayed
    Verify Error Message Is Displayed

User Should Remain On Login Page
    Verify User Is Still On Login Page

Teardown Close Browser
    Close Test Browser