*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}                           https://the-internet.herokuapp.com/login
${LOGIN_PAGE_URL}                     ${BASE_URL}/login
${BROWSER}                            chrome
${VALID_USERNAME}                     tomsmith
${VALID_PASSWORD}                     SuperSecretPassword!
${INVALID_PASSWORD}                   InvalidPassword
${INVALID_USERNAME}                   invaliduser
${VALID_USERNAME_INPUT_FIELD}         id=username
${PASSWORD_INPUT_FIELD}               id=password
${LOGIN_BUTTON}                       xpath=//button[@type='submit']
${SUCCESS_MESSAGE}                    xpath=//div[@id='flash' and contains(text(), 'You logged into a secure area!')]
${ERROR_MESSAGE_INVALID_PASSWORD}     xpath=//div[@id='flash' and contains(text(), 'Your password is invalid!')]
${ERROR_MESSAGE_INVALID_USERNAME}     xpath=//div[@id='flash' and contains(text(), 'Your username is invalid!')]
${DASHBOARD_PAGE_INDICATOR}           xpath=//h2[contains(text(), 'Secure Area')]
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login test cases for the-internet.herokuapp.com
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    [Documentation]    Verify that user can login with valid username 'tomsmith' and password 'SuperSecretPassword!'
    Login With Valid Credentials
    Verify Successful Login
    Close Login Browser

TC_002 Failed Login With Invalid Password
    [Documentation]    Attempt to login with valid username but invalid password 'InvalidPassword'
    Login With Invalid Password
    Verify Failed Login With Invalid Password
    Close Login Browser

TC_003 Failed Login With Invalid Username
    [Documentation]    Attempt to login with invalid username 'invaliduser' and valid password
    Login With Invalid Username
    Verify Failed Login With Invalid Username
    Close Login Browser