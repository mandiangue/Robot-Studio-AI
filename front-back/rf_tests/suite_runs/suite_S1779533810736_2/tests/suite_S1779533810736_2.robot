*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login Application Test Cases
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533810736_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533810736_2/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    Given User Is On Login Page
    When User Enters Valid Username And Valid Password
    And User Clicks The Login Button
    Then User Should See Success Message
    And User Should Be Redirected To Secure Area
    And Cleanup Test Browser

TC_002 Failed Login With Incorrect Password
    Given User Is On Login Page
    When User Enters Valid Username And Invalid Password
    And User Clicks The Login Button
    Then User Should See Error Message For Invalid Password
    And User Should Remain On Login Page
    And Cleanup Test Browser

TC_003 Failed Login With Incorrect Username
    Given User Is On Login Page
    When User Enters Invalid Username And Valid Password
    And User Clicks The Login Button
    Then User Should See Error Message For Invalid Username
    And User Should Remain On Login Page
    And Cleanup Test Browser