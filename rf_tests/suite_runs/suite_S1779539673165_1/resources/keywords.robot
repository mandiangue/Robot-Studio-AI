*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business Keywords for Login Tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779539673165_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779539673165_1/resources/pages/login_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Given Open Login Page
    Open Login Page

When Enter Valid Credentials
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

When Enter Invalid Password With Valid Username
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}

When Enter Invalid Username With Valid Password
    Enter Username    ${INVALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

And Click Login
    Click Login Button

Then User Should See Success Message
    Verify Success Message Is Displayed
    Verify User Is On Secure Area

Then User Should See Invalid Password Error
    Verify Error Message Password Is Displayed
    Verify User Is On Login Page

Then User Should See Invalid Username Error
    Verify Error Message Username Is Displayed
    Verify User Is On Login Page

And Close Browser
    Close Login Page