*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Suite for Saucedemo
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779895000809_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779895000809_2/resources/keywords.robot



*** Test Cases ***
TC_001 - Login With Locked User Account
    Given Navigate To Login Page
    When Attempt Login With Locked User
    Then Verify Locked User Error Message

TC_002 - Sort Products By Price Low To High
    Given Login With Valid User
    When Apply Sort Price Low To High
    Then Verify Products Sorted By Price Ascending

TC_003 - Logout From Burger Menu
    Given Login With Valid User
    When Open Navigation Menu
    And Perform Logout
    Then Verify User Is Logged Out