*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for login test cases
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779552902577_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779552902577_1/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page
    main_page.Open Login Page

Enter Valid Credentials
    main_page.Enter Username    ${USERNAME}
    main_page.Enter Password    ${PASSWORD}

Enter Credentials With Wrong Password
    main_page.Enter Username    ${USERNAME}
    main_page.Enter Password    ${WRONG_PASSWORD}

Enter Credentials With Wrong Username
    main_page.Enter Username    ${WRONG_USERNAME}
    main_page.Enter Password    ${WRONG_PASSWORD}

Click On Login Button
    main_page.Click Login Button

User Should Be Redirected To Secure Page
    main_page.User Should Be On Secure Page

Success Message Should Be Displayed
    main_page.Flash Message Should Contain    ${SUCCESS_MESSAGE}

User Should Stay On Login Page
    main_page.User Should Remain On Login Page

Invalid Password Message Should Be Displayed In Red
    main_page.Flash Message Should Contain         ${INVALID_PASSWORD_MSG}
    main_page.Flash Message Should Be Displayed In Red

Invalid Username Message Should Be Displayed In Red
    main_page.Flash Message Should Contain         ${INVALID_USERNAME_MSG}
    main_page.Flash Message Should Be Displayed In Red

Close Browser Session
    main_page.Close Login Page