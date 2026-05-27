*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo — 3 test cases
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    [Documentation]    Access saucedemo.com, enter valid credentials for standard_user,
    ...                click Login and verify redirection to inventory page.
    [Tags]             login    smoke

    When Fill In Login Form With Valid Credentials
    And Submit Login Form
    Then Inventory Page Should Be Displayed


TC_002 — Add Product To Cart After Login
    [Documentation]    After login with standard_user, click Add to cart on the first product
    ...                and verify the cart badge shows 1 and the button changes to Remove.
    [Tags]             cart    regression

    And Fill In Login Form With Valid Credentials
    And Submit Login Form
    And Inventory Page Should Be Displayed
    When Add First Product To Cart
    Then Cart Badge Should Display One Item
    And First Product Button Should Be Remove


TC_003 — Failed Login With Locked Out User
    [Documentation]    Access saucedemo.com, enter credentials for locked_out_user,
    ...                click Login and verify the error message and user stays on login page.
    [Tags]             login    negative

    When Fill In Login Form With Locked User Credentials
    And Submit Login Form
    Then Locked Out Error Message Should Be Displayed
    And User Should Stay On Login Page
