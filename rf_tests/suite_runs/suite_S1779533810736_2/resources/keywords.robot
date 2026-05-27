*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business Keywords for Login Tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533810736_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533810736_2/resources/pages/login_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

Given User Is On Login Page
    Open Login Page

When User Enters Valid Username And Valid Password
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

When User Enters Valid Username And Invalid Password
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}

When User Enters Invalid Username And Valid Password
    Enter Username    ${INVALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

And User Clicks The Login Button
    Click Login Button

Then User Should See Success Message
    ${message}=    Get Success Message Text
    Should Contain    ${message}    ${EXPECTED_SUCCESS_TEXT}

Then User Should Be Redirected To Secure Area
    Verify User Is On Secure Area

Then User Should See Error Message For Invalid Password
    ${message}=    Get Error Message Text
    Should Contain    ${message}    ${EXPECTED_ERROR_PASSWORD}

Then User Should See Error Message For Invalid Username
    ${message}=    Get Error Message Text
    Should Contain    ${message}    ${EXPECTED_ERROR_USERNAME}

Then User Should Remain On Login Page
    Verify User Is Still On Login Page

And Cleanup Test Browser
    Close Login Browser