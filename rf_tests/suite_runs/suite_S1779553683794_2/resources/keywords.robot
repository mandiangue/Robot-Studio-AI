*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for SauceDemo test suite (BDD style)
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779553683794_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779553683794_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page


Fill In Login Form With Valid Credentials
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

Fill In Login Form With Invalid Password
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${WRONG_PASSWORD}

Submit Login Form
    Click Login Button

Verify Products Page Is Displayed
    Products Page Is Displayed

Add First Product To Cart
    Click Add To Cart For First Product

Verify Cart Badge Displays One
    Cart Badge Shows    1

Verify First Product Button Changed To Remove
    First Product Button Shows Remove

Verify Error Message Is Displayed
    Error Message Is Displayed

Verify User Stays On Login Page
    User Remains On Login Page

Close The Browser