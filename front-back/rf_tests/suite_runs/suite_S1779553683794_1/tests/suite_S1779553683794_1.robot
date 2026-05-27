*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login test cases for the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779553683794_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779553683794_1/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    [Documentation]    Navigate to the login page, enter valid credentials and verify
    ...                the user is redirected to the secure area with a success message.
    [Tags]             login    positive

    When Enter Username    ${USERNAME}
    And Enter Password    ${VALID_PASSWORD}
    And Click Login Button
    Then User Should Be On Secure Page
    And Flash Message Should Contain Success

TC_002 — Login Failure With Incorrect Password
    [Documentation]    Navigate to the login page, enter a wrong password and verify
    ...                the user stays on the login page with an invalid password error.
    [Tags]             login    negative

    When Enter Username    ${USERNAME}
    And Enter Password    ${WRONG_PASSWORD}
    And Click Login Button
    Then User Should Remain On Login Page
    And Flash Message Should Contain Invalid Password Error

TC_003 — Login Failure With Incorrect Username
    [Documentation]    Navigate to the login page, enter a wrong username and verify
    ...                the user stays on the login page with an invalid username error.
    [Tags]             login    negative

    When Enter Username    ${WRONG_USERNAME}
    And Enter Password    ${VALID_PASSWORD}
    And Click Login Button
    Then User Should Remain On Login Page
    And Flash Message Should Contain Invalid Username Error