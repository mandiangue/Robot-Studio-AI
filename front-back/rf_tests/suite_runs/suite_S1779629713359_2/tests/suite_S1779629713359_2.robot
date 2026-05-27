*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo — 3 test cases
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629713359_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629713359_2/resources/keywords.robot

*** Test Cases ***
TC_001 — Login With Locked Out User
    [Documentation]    Attempt to log in with locked_out_user and verify the error message
    [Tags]             login    locked

    When Enter Locked Out User Credentials And Submit
    Then Verify Locked Out Error Message Is Shown


TC_002 — Sort Products By Ascending Price
    [Documentation]    Log in as standard_user and sort products by price low to high
    [Tags]             products    sorting

    And Enter Standard User Credentials And Submit
    And Verify Products Page Is Displayed
    When Apply Sort By Price Low To High
    Then Verify Products Are Sorted From Lowest To Highest Price


TC_003 — Complete An Order With Shipping Information
    [Documentation]    Log in, add a product, checkout, fill shipping info and confirm the order
    [Tags]             checkout    order

    And Enter Standard User Credentials And Submit
    And Verify Products Page Is Displayed
    And Add A Product To The Cart
    And Navigate To Cart Page
    When Proceed To Checkout
    And Fill In Shipping Information
    And Finish And Confirm The Order
    Then Verify Order Confirmation Message Is Displayed