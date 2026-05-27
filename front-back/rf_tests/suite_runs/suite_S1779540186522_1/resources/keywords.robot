*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540186522_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540186522_1/resources/pages/login_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Given Open Login Page

    Verify Login Page Is Displayed

When User Enters Valid Credentials
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}
    Click Login Button

When User Enters Invalid Password
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}
    Click Login Button

When User Enters Invalid Username
    Enter Username    ${INVALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}
    Click Login Button

Then User Should See Success Message
    Verify Success Message Displayed

Then User Should See Invalid Password Error
    Verify Invalid Password Error Displayed

Then User Should See Invalid Username Error
    Verify Invalid Username Error Displayed

Then User Should Remain On Login Page
    Verify Login Page Is Displayed

And Close Browser Session