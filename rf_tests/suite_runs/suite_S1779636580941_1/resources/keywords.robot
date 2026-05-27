*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--headless=new");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage");add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic");
Suite Teardown    Close Browser
Documentation    Business Keywords for Login Test Suite
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779636580941_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779636580941_1/resources/pages/login_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Given Open Login Page
    Open Login Page

When Enter Valid Credentials
    Enter Username    tomsmith
    Enter Password    SuperSecretPassword!

When Enter Invalid Password
    Enter Username    tomsmith
    Enter Password    WrongPassword123

When Enter Invalid Username
    Enter Username    wronguser
    Enter Password    SuperSecretPassword!

When Click Login Button
    Click Login Button

Then User Is Redirected To Secure Area
    Verify User Is On Secure Page

Then Success Message Is Displayed
    Verify Success Message Is Displayed

Then User Remains On Login Page
    Verify User Is On Login Page

Then Error Password Message Is Displayed
    Verify Error Password Message Is Displayed

Then Error Username Message Is Displayed
    Verify Error Username Message Is Displayed

Given User Is Logged In With Valid Credentials
    Open Login Page
    Enter Username    tomsmith
    Enter Password    SuperSecretPassword!
    Click Login Button
    Verify User Is On Secure Page

When Click Logout Button
    Click Logout Button

Then User Is Redirected To Login Page
    Verify User Is On Login Page

Then Logout Message Is Displayed
    Verify Logout Message Is Displayed

And Close Browser Session