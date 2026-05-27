*** Settings ***
Suite Setup       Go To    ${url}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier BDD
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779727684194_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779727684194_1/resources/pages/main_page.robot

*** Keywords ***
Given User Is On The Login Page
    Open Login Page

When User Logs In With Valid Credentials
    Enter Username    ${VALID_USER}
    Enter Password    ${VALID_PASS}
    Click Login Button

When User Logs In With Wrong Password
    Enter Username    ${VALID_USER}
    Enter Password    ${WRONG_PASS}
    Click Login Button

When User Logs In With Wrong Username
    Enter Username    ${WRONG_USER}
    Enter Password    ${VALID_PASS}
    Click Login Button

Then User Should See Success Message
    Verify Success Message Is Displayed

Then User Should See Invalid Password Error
    Verify Invalid Password Error Is Displayed

Then User Should See Invalid Username Error
    Verify Invalid Username Error Is Displayed

When User Clicks Logout
    Click Logout Button

Then User Should See Logout Confirmation Message
    Verify Logout Message Is Displayed

Open Browser No Popup    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()