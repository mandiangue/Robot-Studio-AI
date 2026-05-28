*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests SauceDemo - Keyword Driven
Library    SeleniumLibrary
Library    Collections
Library    String
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779987586593_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779987586593_2/resources/keywords.robot



*** Test Cases ***
TC_001 - Login With Locked User Account
    [Documentation]    Attempt to login with locked_out_user and verify error message is displayed
    Given Login With Locked User
    Then Verify Locked User Cannot Login

TC_002 - Sort Products By Price Low To High
    [Documentation]    Login with standard_user and sort products by price low to high
    Given Login With Standard User
    When Sort Products By Price Low To High

TC_003 - Remove Product From Cart
    [Documentation]    Login with standard_user, add product to cart, then remove it and verify cart is empty
    Given Login With Standard User
    When Add Product To Cart And Go To Cart
    Then Remove Product From Cart And Verify Cart Is Empty