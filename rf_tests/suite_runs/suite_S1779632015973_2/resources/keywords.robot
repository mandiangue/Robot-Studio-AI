*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for SauceDemo test suite — BDD style
Library           SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779632015973_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779632015973_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page


Enter Valid Credentials
    Fill Username Field
    Fill Password Field

Submit Login Form
    Click Login Button

Products Page Should Be Displayed
    Verify Products Page Is Displayed

Add First Product To Cart
    Click Add To Cart For First Product

Cart Badge Should Show One Item
    Verify Cart Badge Shows One

First Product Button Should Be Remove
    Verify First Product Button Is Remove

Open Side Menu
    Open Burger Menu

Logout From Application
    Click Logout Option

Login Page Should Be Displayed
    Verify Login Page Is Displayed

Protected Page Should Not Be Accessible Without Login
    Verify Protected Page Is Not Accessible

Close Browser Session
    Close Test Browser