*** Settings ***
Suite Setup       Go To    ${MSG_LOGIN_OK}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for login test suite — BDD style
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779632015973_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779632015973_1/resources/pages/login_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page
    [Documentation]    Navigate to the login page and wait for it to be ready
    Open Login Page

Enter Valid Credentials
    [Documentation]    Enter the valid username and password
    Enter Username    ${USERNAME_VALID}
    Enter Password    ${PASSWORD_VALID}

Enter Credentials With Wrong Password
    [Documentation]    Enter a valid username but an incorrect password
    Enter Username    ${USERNAME_VALID}
    Enter Password    ${PASSWORD_WRONG}

Enter Credentials With Wrong Username
    [Documentation]    Enter an invalid username but the correct password
    Enter Username    ${USERNAME_WRONG}
    Enter Password    ${PASSWORD_VALID}

Submit Login Form
    [Documentation]    Click the login button to submit the form
    Click Login Button

User Is Redirected To Secure Page
    [Documentation]    Verify the user lands on the secure area page
    User Should Be On Secure Page
    Flash Message Should Contain    ${MSG_LOGIN_OK}

User Remains On Login Page With Password Error
    [Documentation]    Verify the user stays on login page with invalid password message
    User Should Stay On Login Page
    Flash Message Should Contain    ${MSG_LOGIN_FAIL_PW}

User Remains On Login Page With Username Error
    [Documentation]    Verify the user stays on login page with invalid username message
    User Should Stay On Login Page
    Flash Message Should Contain    ${MSG_LOGIN_FAIL_USR}

User Logs Out
    [Documentation]    Click the logout button on the secure page
    Click Logout Button

User Is Redirected To Login Page After Logout
    [Documentation]    Verify the user is back on login page with logout confirmation
    User Should Stay On Login Page
    Flash Message Should Contain    ${MSG_LOGOUT}

Close Browser Session
    [Documentation]    Close the browser after the test is complete
    Close Login Page