*** Settings ***
Documentation    Business keywords for login scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779630620686_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779630620686_1/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open The Login Page
    Open Login Page

Enter Valid Credentials
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

Enter Credentials With Wrong Password
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${WRONG_PASSWORD}

Enter Credentials With Wrong Username
    Enter Username    ${WRONG_USERNAME}
    Enter Password    ${VALID_PASSWORD}

Submit The Login Form
    Click Login Button

Verify Successful Login Message
    Flash Message Should Contain    You logged into a secure area!

Verify Invalid Password Message
    Flash Message Should Contain    Your password is invalid!

Verify Invalid Username Message
    Flash Message Should Contain    Your username is invalid!

Perform Logout
    Click Logout Button

Verify Successful Logout Message
    Flash Message Should Contain    You logged out of the secure area!

Close The Browser
    Close Login Page