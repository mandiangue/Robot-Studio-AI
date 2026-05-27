*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779554637765_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779554637765_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page
    main_page.Open Login Page

Enter Valid Credentials
    main_page.Enter Username    ${USERNAME}
    main_page.Enter Password    ${VALID_PASSWORD}

Enter Credentials With Invalid Password
    main_page.Enter Username    ${USERNAME}
    main_page.Enter Password    ${INVALID_PASSWORD}

Enter Credentials With Invalid Username
    main_page.Enter Username    ${INVALID_USERNAME}
    main_page.Enter Password    ${INVALID_PASSWORD}

Submit Login Form
    main_page.Click Login Button

Verify User Is Logged In Successfully
    main_page.Verify Successful Login

Verify Error Message For Invalid Password Is Displayed
    main_page.Verify Invalid Password Error

Verify Error Message For Invalid Username Is Displayed
    main_page.Verify Invalid Username Error

Close Browser Session
    main_page.Close Login Page