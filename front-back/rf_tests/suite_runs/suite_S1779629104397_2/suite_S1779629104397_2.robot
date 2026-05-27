*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Test Cases for Login Application
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629104397_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629104397_2/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials
    Given User Accesses Login Page
    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Should See Success Message


TC_002 Login With Invalid Password
    Given User Accesses Login Page
    When User Enters Invalid Password
    And User Clicks Login Button
    Then User Should See Invalid Password Error


TC_003 Login With Invalid Username
    Given User Accesses Login Page
    When User Enters Invalid Username
    And User Clicks Login Button
    Then User Should See Invalid Username Error


TC_004 Logout After Successful Login
    Given User Accesses Login Page
    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Should See Success Message
    When User Clicks Logout Button
    Then User Should See Logout Confirmation Message
