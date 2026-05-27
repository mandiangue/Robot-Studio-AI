*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business Keywords for Login Test Suite
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540564412_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540564412_1/resources/pages/login_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Given User Opens Login Page
    Open Login Page

When User Enters Valid Credentials
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

When User Enters Valid Username And Invalid Password
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}

When User Enters Invalid Username And Valid Password
    Enter Username    ${INVALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

And User Clicks Login Button
    Click Login Button

Then User Should See Success Message
    Verify Success Message Is Displayed

Then User Should See Password Error Message
    Verify Error Password Message Is Displayed

Then User Should See Username Error Message
    Verify Error Username Message Is Displayed

And User Should Remain On Login Page
    Verify User Remains On Login Page

And Close Browser Session