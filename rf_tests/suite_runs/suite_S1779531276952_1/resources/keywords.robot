*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

Open Login Page

    Wait Until Page Contains Element    ${USERNAME_FIELD}    timeout=10s

Close Browser Session


Login With Credentials
    [Arguments]    ${username}    ${password}
    Input Username    ${username}
    Input Password    ${password}
    Click Login Button

Verify Successful Login
    Verify Welcome Message Is Displayed
    Verify Logout Button Is Displayed

Verify Failed Login
    Verify Error Message Is Displayed
    Verify Error Message Contains Invalid Credentials Text
    Verify User Remains On Login Page