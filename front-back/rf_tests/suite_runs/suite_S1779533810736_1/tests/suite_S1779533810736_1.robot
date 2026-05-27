*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for SauceDemo application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533810736_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533810736_1/resources/keywords.robot

*** Test Cases ***
TC_001 Authentication With Valid Credentials
    Given User Navigates To SauceDemo Login Page
    When User Enters Valid Credentials And Submits Login Form
    Then User Should Be Successfully Authenticated And See Products List


TC_002 Add Products To Cart
    Given User Navigates To SauceDemo Login Page
    When User Enters Valid Credentials And Submits Login Form
    Then User Should Be Successfully Authenticated And See Products List
    When User Adds Two Different Products To Cart
    Then Cart Should Display Two Items


TC_003 Validate Checkout Form With Valid Payment Information
    Given User Navigates To SauceDemo Login Page
    When User Enters Valid Credentials And Submits Login Form
    Then User Should Be Successfully Authenticated And See Products List
    When User Adds Two Different Products To Cart
    When User Opens Cart And Proceeds To Checkout With Valid Shipping Information
    Then User Should See Order Confirmation Page


TC_004 Authentication With Invalid Credentials
    Given User Navigates To SauceDemo Login Page
    When User Enters Invalid Credentials And Submits Login Form
    Then Error Message Should Be Displayed And User Should Remain On Login Page