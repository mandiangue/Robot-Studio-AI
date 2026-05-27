*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for login test suite
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779551657192_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779551657192_1/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page
    main_page.Open Login Page

Enter Valid Credentials
    main_page.Enter Username    ${VALID_USERNAME}
    main_page.Enter Password    ${VALID_PASSWORD}

Enter Invalid Password Credentials
    main_page.Enter Username    ${VALID_USERNAME}
    main_page.Enter Password    ${WRONG_PASSWORD}

Enter Invalid Username Credentials
    main_page.Enter Username    ${WRONG_USERNAME}
    main_page.Enter Password    ${WRONG_PASSWORD}

Submit Login Form
    main_page.Click Login Button

Verify Successful Login
    main_page.User Should Be On Secure Page

Verify Invalid Password Error
    main_page.User Should Stay On Login Page
    main_page.Flash Message Should Contain    ${ERROR_PASSWORD}
    main_page.Flash Message Should Be Red

Verify Invalid Username Error
    main_page.User Should Stay On Login Page
    main_page.Flash Message Should Contain    ${ERROR_USERNAME}
    main_page.Flash Message Should Be Red

Close Login Page
    main_page.Close Login Page