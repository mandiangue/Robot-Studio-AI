*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779534210190_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779534210190_2/resources/pages/login_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

Given User Opens Login Page
    Open Login Page

When User Enters Valid Username And Valid Password
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}
    Click Login Button

When User Enters Valid Username And Invalid Password
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}
    Click Login Button

When User Enters Invalid Username And Valid Password
    Enter Username    ${INVALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}
    Click Login Button

Then User Should See Success Message
    ${message}    Get Alert Message
    Should Contain    ${message}    ${SUCCESS_MESSAGE}

Then User Should See Invalid Password Error
    ${message}    Get Alert Message
    Should Contain    ${message}    ${ERROR_INVALID_PASSWORD}

Then User Should See Invalid Username Error
    ${message}    Get Alert Message
    Should Contain    ${message}    ${ERROR_INVALID_USERNAME}

And User Closes Browser