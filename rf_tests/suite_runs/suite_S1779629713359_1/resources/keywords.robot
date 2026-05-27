*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for login test scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629713359_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629713359_1/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page
    main_page.Open Login Page

Enter Valid Credentials
    main_page.Enter Username    ${VALID_USER}
    main_page.Enter Password    ${VALID_PASS}

Enter Credentials With Wrong Password
    main_page.Enter Username    ${VALID_USER}
    main_page.Enter Password    ${WRONG_PASS}

Enter Credentials With Wrong Username
    main_page.Enter Username    ${WRONG_USER}
    main_page.Enter Password    ${VALID_PASS}

Submit Login Form
    main_page.Click Login Button

Verify User Is Logged In Successfully
    main_page.Verify Successful Login Message

Verify Invalid Password Error Is Displayed
    main_page.Verify Invalid Password Message

Verify Invalid Username Error Is Displayed
    main_page.Verify Invalid Username Message

Logout From Secure Area
    main_page.Click Logout Button

Verify User Is Logged Out Successfully
    main_page.Verify Successful Logout Message

Close Browser Session
    main_page.Close Login Page