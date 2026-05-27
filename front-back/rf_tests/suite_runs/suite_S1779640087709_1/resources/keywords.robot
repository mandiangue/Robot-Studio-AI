*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business Keywords for Login Tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779640087709_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779640087709_1/resources/pages/login_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Login With Valid Credentials
    Open Login Page
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}
    Click Login Button

Login With Invalid Password
    Open Login Page
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}
    Click Login Button

Login With Invalid Username
    Open Login Page
    Enter Username    ${INVALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}
    Click Login Button

Login And Navigate To Secure Area
    Open Login Page
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}
    Click Login Button
    Verify User On Secure Area

Logout From Secure Area
    Click Logout Button

Verify Successful Login
    Verify User On Secure Area
    Verify Success Message Displayed

Verify Failed Login With Invalid Password
    Verify User On Login Page
    Verify Error Message For Invalid Password

Verify Failed Login With Invalid Username
    Verify User On Login Page
    Verify Error Message For Invalid Username

Verify Successful Logout
    Verify User On Login Page
    Verify Logout Message Displayed

Teardown Login Test