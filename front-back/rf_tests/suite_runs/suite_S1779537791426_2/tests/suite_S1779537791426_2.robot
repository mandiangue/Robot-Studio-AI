*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Test cases for SauceDemo application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779537791426_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779537791426_2/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials

    When User Enters Valid Credentials
    And User Clicks The Login Button
    Then User Is Redirected To Home Page


TC_002 Add Product To Cart

    When User Enters Valid Credentials
    And User Clicks The Login Button
    And User Adds First Product To Cart
    Then Product Appears In Cart And Badge Shows One Item


TC_003 Login With Invalid Credentials

    When User Enters Invalid Credentials
    And User Clicks The Login Button
    Then Error Message Is Displayed For Invalid Credentials


TC_004 Verify Product Sorting By Price

    When User Enters Valid Credentials
    And User Clicks The Login Button
    When User Selects Sort By Price Low To High
    Then Products Are Displayed In Ascending Price Order