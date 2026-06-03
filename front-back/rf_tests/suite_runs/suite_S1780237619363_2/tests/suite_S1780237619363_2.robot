*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests - Login scenarios for the-internet.herokuapp.com
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780237619363_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780237619363_2/resources/keywords.robot



*** Test Cases ***
TC_001 - Successful Login With Valid Credentials
    Given User Is On The Login Page
    When User Enters Valid Credentials
    And When User Clicks The Login Button
    Then User Should Be Redirected To Secure Page
    And Then Success Message Should Be Displayed

TC_002 - Failed Login With Wrong Password
    Given User Is On The Login Page
    When User Enters Invalid Password
    And When User Clicks The Login Button
    Then User Should Remain On Login Page
    And Then Error Message Bad Password Should Be Displayed

TC_003 - Failed Login With Wrong Username
    Given User Is On The Login Page
    When User Enters Invalid Username
    And When User Clicks The Login Button
    Then User Should Remain On Login Page
    And Then Error Message Bad Username Should Be Displayed

TC_004 - Logout After Successful Login
    Given User Is On The Login Page
    When User Enters Valid Credentials
    And When User Clicks The Login Button
    Then User Should Be Redirected To Secure Page
    When User Clicks The Logout Button
    Then User Should Be Redirected To Login Page
    And Then Logout Message Should Be Displayed