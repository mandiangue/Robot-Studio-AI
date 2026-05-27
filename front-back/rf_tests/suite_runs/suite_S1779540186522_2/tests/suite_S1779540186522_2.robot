*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for Sauce Demo Application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540186522_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540186522_2/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Should Be Redirected To Home Page


TC_002 Add Product To Cart

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Should Be Redirected To Home Page
    When User Adds Product To Cart
    Then Product Should Be Added To Cart


TC_003 Complete Checkout Process

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Should Be Redirected To Home Page
    When User Adds Product To Cart
    And User Navigates To Cart
    And Cart Should Display The Product
    And User Proceeds To Checkout
    When User Fills Checkout Form
    And User Completes Checkout
    Then Confirmation Message Should Be Displayed


TC_004 Login With Invalid Credentials

    When User Enters Invalid Credentials
    And User Clicks Login Button
    Then Error Message Should Be Displayed