*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for SauceDemo Application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779535182207_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779535182207_2/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials

    When User Enters Valid Credentials
    And User Clicks The Login Button
    Then User Is Authenticated And Redirected To Products Page


TC_002 Add Item To Cart

    When User Enters Valid Credentials
    And User Clicks The Login Button
    Then User Is Authenticated And Redirected To Products Page
    When User Adds Sauce Labs Backpack To Cart
    Then Item Is Added To Cart With Badge And Remove Button


TC_003 Access Cart Page And Verify Content

    When User Enters Valid Credentials
    And User Clicks The Login Button
    Then User Is Authenticated And Redirected To Products Page
    When User Adds Sauce Labs Backpack To Cart
    Then Item Is Added To Cart With Badge And Remove Button
    When User Clicks The Cart Icon
    Then Cart Page Is Displayed With Item Details
    And Checkout Button Is Available


TC_004 Login With Invalid Credentials

    When User Enters Invalid Username And Password
    And User Clicks The Login Button
    Then Error Message Is Displayed Indicating Invalid Credentials