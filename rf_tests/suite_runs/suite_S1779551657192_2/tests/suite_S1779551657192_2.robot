*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests — Saucedemo Login and Cart scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779551657192_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779551657192_2/resources/keywords.robot

*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    [Documentation]    Verify that a user can log in with valid credentials and is redirected to the inventory page.
    [Tags]             login    smoke

    When Enter Valid Credentials
    And Submit Login Form
    Then Inventory Page Should Be Displayed


TC_002 — Failed Login With Wrong Password
    [Documentation]    Verify that an error message is displayed when logging in with an incorrect password.
    [Tags]             login    negative

    When Enter Invalid Password Credentials
    And Submit Login Form
    Then Error Message Should Be Displayed
    And User Should Stay On Login Page


TC_003 — Add A Product To The Cart
    [Documentation]    Verify that a product can be added to the cart and the cart badge updates to 1.
    [Tags]             cart    smoke

    And Enter Valid Credentials
    And Submit Login Form
    And Inventory Page Should Be Displayed
    When Add First Product To Cart
    Then Cart Badge Should Show One
    And Product Button Should Changed To Remove