*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo login scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Login With Valid Credentials
    [Documentation]    Access saucedemo.com and log in with valid username 'standard_user' and password 'secret_sauce'. The user should be redirected to the products page and the title 'Products' should be displayed.
    [Tags]    login    valid    smoke
    Given The User Is On The Login Page
    When The User Logs In With Valid Credentials
    Then The User Should Be Redirected To The Products Page

TC_002 — Login With Invalid Credentials
    [Documentation]    Access saucedemo.com and attempt to log in with incorrect username 'wrong_user' and password 'secret_sauce'. An error message should be displayed and the user should remain on the login page.
    [Tags]    login    invalid    negative
    Given The User Is On The Login Page
    When The User Logs In With Invalid Credentials
    Then An Error Message Should Be Displayed For Invalid Credentials
    And The User Should Remain On The Login Page

TC_003 — Login With Locked Out User
    [Documentation]    Access saucedemo.com and attempt to log in with locked username 'locked_out_user' and password 'secret_sauce'. An error message should be displayed indicating the user is locked out and access is denied.
    [Tags]    login    locked    negative
    Given The User Is On The Login Page
    When The User Logs In With Locked Account Credentials
    Then An Error Message Should Be Displayed For Locked User
    And The User Should Remain On The Login Page