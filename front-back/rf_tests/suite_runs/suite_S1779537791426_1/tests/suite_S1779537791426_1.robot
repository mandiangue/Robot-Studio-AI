*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779537791426_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779537791426_1/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials

    When User Enters Valid Username And Valid Password
    And User Clicks Login Button
    Then User Should See Success Message


TC_002 Failed Login With Invalid Password

    When User Enters Valid Username And Invalid Password
    And User Clicks Login Button
    Then User Should See Password Error Message


TC_003 Failed Login With Invalid Username

    When User Enters Invalid Username And Valid Password
    And User Clicks Login Button
    Then User Should See Username Error Message