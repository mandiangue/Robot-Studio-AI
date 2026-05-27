*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Test Cases for Sauce Demo application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_SAUCE_001 Login With Valid Credentials

    When User Enters Valid Credentials
    When User Clicks The Login Button
    Then User Should See The Product List


TC_SAUCE_002 Add Product To Cart

    When User Enters Valid Credentials
    When User Clicks The Login Button
    Then User Should See The Product List
    When User Selects A Product And Adds It To Cart
    Then The Product Should Appear In Cart With Correct Count
    Then The Product Price Should Be Visible


TC_SAUCE_003 Complete Payment Process

    When User Enters Valid Credentials
    When User Clicks The Login Button
    Then User Should See The Product List
    When User Selects A Product And Adds It To Cart
    When User Navigates To Cart
    When User Proceeds To Checkout
    When User Fills Delivery Information With Personal Data
    When User Clicks Continue Button
    When User Completes Payment Process
    Then Confirmation Message Should Be Displayed
