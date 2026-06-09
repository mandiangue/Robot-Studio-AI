*** Settings ***
Test Teardown    Capture Page Screenshot
Test Setup        Go To    ${BASE_URL}
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    SauceDemo test suite — 6 test cases
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780767636109_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780767636109_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Login With Performance Glitch User
    Given User Opens SauceDemo Website
    When User Logs In With Performance Glitch User
    Then Inventory Page Should Be Displayed

TC_002 — Sort Products By Price High To Low
    Given User Is Logged In As Standard User
    When User Selects Sort By Price High To Low
    Then Products Should Be Displayed From High To Low Price

TC_003 — Add Multiple Products To Cart
    Given User Is Logged In As Standard User
    When User Adds Three Different Products To Cart
    Then Cart Badge Should Display Three
    Then Cart Should Contain Three Items

TC_004 — Remove A Product From Cart
    Given User Is Logged In As Standard User
    When User Adds Two Products To Cart
    When User Navigates To Cart Page
    When User Removes One Product From Cart
    Then Cart Badge Should Display One
    Then Cart Should Contain One Item

TC_005 — Complete Order With Valid Information
    Given User Is Logged In As Standard User
    When User Adds One Product To Cart
    When User Proceeds To Checkout
    When User Fills Checkout Form With Valid Information
    When User Finishes The Order
    Then Order Confirmation Message Should Be Displayed

TC_006 — Logout Via Hamburger Menu
    Given User Is Logged In As Standard User
    When User Opens Hamburger Menu
    When User Clicks Logout
    Then User Should Be Redirected To Login Page