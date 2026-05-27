*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Test cases for Sauce Demo application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779538282768_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779538282768_2/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials

    When User Enters Valid Username
    And User Enters Valid Password
    And User Clicks Login Button
    Then User Should Be Successfully Logged In

TC_002 Add Product To Cart

    When User Enters Valid Username
    And User Enters Valid Password
    And User Clicks Login Button
    Then User Should Be Successfully Logged In
    When User Adds First Product To Cart
    Then Product Should Be Added To Cart

TC_003 Sort Products By Price Ascending

    When User Enters Valid Username
    And User Enters Valid Password
    And User Clicks Login Button
    Then User Should Be Successfully Logged In
    When User Selects Sort Option Price Ascending
    Then Products List Should Be Sorted By Price Ascending

TC_004 Complete Order Process

    When User Enters Valid Username
    And User Enters Valid Password
    And User Clicks Login Button
    Then User Should Be Successfully Logged In
    When User Adds First Product To Cart
    Then Product Should Be Added To Cart
    When User Navigates To Cart Page
    And User Proceeds To Checkout
    And User Enters Shipping Information
    And User Completes The Order
    Then Order Should Be Successfully Completed