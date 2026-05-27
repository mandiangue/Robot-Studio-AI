*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for login scenarios on the Internet Herokuapp
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    [Documentation]    Access the login page, enter valid username and password, click login.
    ...                Expected: User is redirected to the secure area and success message is displayed.
    [Tags]             login    positive

    When Enter Valid Credentials
    And Submit Login Form
    Then Verify Successful Login


TC_002 — Failed Login With Incorrect Password
    [Documentation]    Access the login page, enter valid username and wrong password, click login.
    ...                Expected: User stays on login page and error message 'Your password is invalid!' is displayed in red.
    [Tags]             login    negative

    When Enter Credentials With Wrong Password
    And Submit Login Form
    Then Verify Failed Login With Wrong Password


TC_003 — Failed Login With Incorrect Username
    [Documentation]    Access the login page, enter invalid username and wrong password, click login.
    ...                Expected: User stays on login page and error message 'Your username is invalid!' is displayed in red.
    [Tags]             login    negative

    When Enter Credentials With Wrong Username
    And Submit Login Form
    Then Verify Failed Login With Wrong Username
