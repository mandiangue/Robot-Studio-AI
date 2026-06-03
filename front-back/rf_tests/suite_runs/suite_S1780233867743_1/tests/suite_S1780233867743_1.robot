*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests saucedemo.com
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780233867743_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780233867743_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Login With Locked User Account
    Given The Login Page Is Open
    When User Logs In With Locked Account
    Then An Error Message Should Be Displayed For Locked User

TC_002 — Sort Products By Price Low To High
    Given The User Is Logged In As Standard User
    Then The Products Page Should Be Loaded
    When User Selects Sort By Price Low To High
    Then Products Should Be Sorted By Price Ascending

TC_003 — Remove Item From Cart
    Given The User Is Logged In As Standard User
    Then The Products Page Should Be Loaded
    When User Adds First Product To Cart
    And User Navigates To Cart
    When User Removes The Item From Cart
    Then The Cart Should Be Empty
    And The Cart Badge Should Not Be Visible