*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for login scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627141831_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627141831_1/resources/pages/login_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page
    pages/login_page.Open Login Page

Enter Valid Credentials
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

Enter Credentials With Wrong Password
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${WRONG_PASSWORD}

Enter Credentials With Wrong Username
    Enter Username    ${WRONG_USERNAME}
    Enter Password    ${VALID_PASSWORD}

Submit Login Form
    Click Login Button

Verify Successful Login
    Flash Message Should Contain    You logged into a secure area!

Verify Invalid Password Error
    Flash Message Should Contain    Your password is invalid!

Verify Invalid Username Error
    Flash Message Should Contain    Your username is invalid!

Logout From Secure Area
    Click Logout Button

Verify Successful Logout
    Flash Message Should Contain    You logged out of the secure area!

Close Browser Session
    Close Login Page