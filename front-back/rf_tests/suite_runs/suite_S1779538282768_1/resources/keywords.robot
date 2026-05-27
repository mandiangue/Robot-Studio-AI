*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779538282768_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779538282768_1/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}


Given User Opens The Login Page
    Open Login Page

When User Enters Valid Username And Valid Password
    Input Username    ${VALID_USERNAME}
    Input Password    ${VALID_PASSWORD}

When User Enters Valid Username And Invalid Password
    Input Username    ${VALID_USERNAME}
    Input Password    ${INVALID_PASSWORD}

When User Enters Invalid Username And Valid Password
    Input Username    ${INVALID_USERNAME}
    Input Password    ${VALID_PASSWORD}

And User Clicks The Login Button
    Click Login Button

Then Success Message Should Be Displayed
    Verify Success Message Is Displayed

Then Error Message For Invalid Password Should Be Displayed
    Verify Error Message Contains Text    ${ERROR_MESSAGE_INVALID_PASSWORD}

Then Error Message For Invalid Username Should Be Displayed
    Verify Error Message Contains Text    ${ERROR_MESSAGE_INVALID_USERNAME}

And User Should Remain On Login Page
    Verify User Remains On Login Page