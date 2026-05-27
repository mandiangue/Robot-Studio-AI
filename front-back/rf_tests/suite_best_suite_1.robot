*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login test cases for the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Username    ${VALID_USER}
    And Enter Password    ${VALID_PASS}
    And Click Login Button
    Then Verify Successful Login Message

TC_002 — Failed Login With Incorrect Password

    When Enter Username    ${VALID_USER}
    And Enter Password    ${INVALID_PASS}
    And Click Login Button
    Then Verify Invalid Password Message

TC_003 — Failed Login With Incorrect Username

    When Enter Username    ${INVALID_USER}
    And Enter Password    ${INVALID_PASS}
    And Click Login Button
    Then Verify Invalid Username Message