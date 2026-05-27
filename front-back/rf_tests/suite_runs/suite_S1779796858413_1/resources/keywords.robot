*** Settings ***
Suite Setup       Go To    ${url}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779796858413_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779796858413_1/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()


Login With Valid Credentials
    Open Login Page
    Enter Username    tomsmith
    Enter Password    SuperSecretPassword!
    Click Login Button

Login With Wrong Password
    Open Login Page
    Enter Username    tomsmith
    Enter Password    WrongPassword123
    Click Login Button

Login With Wrong Username
    Open Login Page
    Enter Username    wronguser
    Enter Password    SuperSecretPassword!
    Click Login Button

Verify Successful Login
    Verify Success Message

Verify Failed Login With Wrong Password
    Verify Invalid Password Message
    Verify Login Page Is Displayed

Verify Failed Login With Wrong Username
    Verify Invalid Username Message
    Verify Login Page Is Displayed

Logout From Secure Area
    Click Logout Button
    Verify Logout Message
    Verify Login Page Is Displayed