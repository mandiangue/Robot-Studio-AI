*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Test Suite — SauceDemo BDD Scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779630620686_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779630620686_2/resources/keywords.robot

*** Test Cases ***
TC_001 — Login With Locked Out User
    [Documentation]    Attempt to log in with locked_out_user and verify the error message is shown
    [Tags]             login    locked    TC_001

    When Enter Locked User Credentials
    And Click Login Button
    Then Locked Out Error Message Is Displayed


TC_002 — Sort Products By Price Low To High
    [Documentation]    Log in as standard_user, sort products by Price low to high and verify the order
    [Tags]             products    sort    TC_002

    When Enter Standard User Credentials
    And Click Login Button
    Then User Is Logged In And On Products Page
    When Sort Products By Price Low To High
    Then Products Are Displayed From Cheapest To Most Expensive


TC_003 — Remove A Product From The Cart
    [Documentation]    Log in as standard_user, add a product to cart, remove it and verify the cart is empty
    [Tags]             cart    remove    TC_003

    When Enter Standard User Credentials
    And Click Login Button
    Then User Is Logged In And On Products Page
    When Add A Product To The Cart
    And Go To The Cart Page
    And Remove The Product From The Cart
    Then The Cart Is Empty And Badge Is Gone
