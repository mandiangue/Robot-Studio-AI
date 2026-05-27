*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier — Keyword-Driven ALL keyword names in English
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627870026_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627870026_1/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page
    main_page.Open Login Page

Login With Valid Credentials
    main_page.Enter Username    ${USERNAME}
    main_page.Enter Password    ${PASSWORD}
    main_page.Click Login Button

Login With Wrong Password
    main_page.Enter Username    ${USERNAME}
    main_page.Enter Password    ${WRONG_PASSWORD}
    main_page.Click Login Button

Login With Wrong Username
    main_page.Enter Username    ${WRONG_USERNAME}
    main_page.Enter Password    ${PASSWORD}
    main_page.Click Login Button

Verify Successful Login
    main_page.Verify Success Message

Verify Invalid Password Error
    main_page.Verify Invalid Password Message

Verify Invalid Username Error
    main_page.Verify Invalid Username Message

Perform Logout
    main_page.Click Logout Button

Verify Successful Logout
    main_page.Verify Logout Message

Close Browser Session
    main_page.Close Login Page