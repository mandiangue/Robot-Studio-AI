*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation      Tests SauceDemo
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780048980605_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780048980605_2/resources/keywords.robot



*** Test Cases ***
TC_001 — Login With Locked Out User
    Given Login With Locked Out User
    Then Verify Locked Out Error Is Displayed

TC_002 — Sort Products By Price Low To High
    Given Login With Standard User
    When Sort Products By Price Low To High
    Then Verify Products Are Sorted By Price Ascending

TC_003 — Logout From Burger Menu
    Given Login With Standard User
    When Logout From Burger Menu
    Then Verify User Is On Login Page