*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for login test scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779553683794_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779553683794_1/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page
    main_page.Open Login Page

Enter Username
    [Arguments]    ${username}
    main_page.Enter Username    ${username}

Enter Password
    [Arguments]    ${password}
    main_page.Enter Password    ${password}

Click Login Button
    main_page.Click Login Button

Flash Message Should Contain Success
    main_page.Flash Message Should Contain Success

Flash Message Should Contain Invalid Password Error
    main_page.Flash Message Should Contain Invalid Password Error

Flash Message Should Contain Invalid Username Error
    main_page.Flash Message Should Contain Invalid Username Error

User Should Be On Secure Page
    main_page.User Should Be On Secure Page

User Should Remain On Login Page
    main_page.User Should Remain On Login Page

Close Login Page
    main_page.Close Login Page