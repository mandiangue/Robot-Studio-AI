*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Tests fonctionnels SauceDemo — TC_001 / TC_002 / TC_003
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Login With A Locked User Account

    When Login With Locked User Account
    Then Verify Locked User Error Message Is Shown

TC_002 — Sort Products By Ascending Price

    And Login With Valid Account
    When Sort Products By Price Low To High
    Then Verify Products Order Is Price Ascending

TC_003 — Logout Via Burger Menu

    And Login With Valid Account
    When Open Hamburger Menu
    And Logout From Application
    Then Verify Redirection To Login Page