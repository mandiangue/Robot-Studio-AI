*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779535182207_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779535182207_1/resources/pages/login_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

Given User Opens Login Page

    Maximize Browser Window

When User Enters Valid Username And Valid Password
    Enter Username In Login Form    ${VALID_USERNAME}
    Enter Password In Login Form    ${VALID_PASSWORD}
    Click Login Button

When User Enters Valid Username And Invalid Password
    Enter Username In Login Form    ${VALID_USERNAME}
    Enter Password In Login Form    ${INVALID_PASSWORD}
    Click Login Button

When User Enters Invalid Username And Valid Password
    Enter Username In Login Form    ${INVALID_USERNAME}
    Enter Password In Login Form    ${VALID_PASSWORD}
    Click Login Button

Then User Is Redirected To Secure Area With Success Message
    Verify Success Message Is Displayed

Then User Remains On Login Page With Invalid Password Error
    Verify User Is On Login Page
    Verify Invalid Password Error Message Is Displayed

Then User Remains On Login Page With Invalid Username Error
    Verify User Is On Login Page
    Verify Invalid Username Error Message Is Displayed

And User Closes Browser