*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Tests - SauceDemo Login and Cart
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Fill Login Form With Valid Credentials
    And Submit Login Form
    Then Inventory Page Should Be Displayed

TC_002 — Failed Login With Invalid Credentials

    When Fill Login Form With Invalid Credentials
    And Submit Login Form
    Then Error Message Should Be Displayed
    And User Should Stay On Login Page

TC_003 — Add A Product To The Cart

    When Fill Login Form With Valid Credentials
    And Submit Login Form
    And Inventory Page Should Be Displayed
    When Add First Product To Cart
    Then Cart Badge Should Show One Item
    And Product Button Should Show Remove