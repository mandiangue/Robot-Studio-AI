*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests SauceDemo - Keyword Driven
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779981691714_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779981691714_2/resources/keywords.robot



*** Test Cases ***
TC_001 - Login With Locked User Account
    Given Login With Credentials    ${LOCKED_USER}    ${PASSWORD}
    Then Verify Locked User Error Message

TC_002 - Sort Products By Price Low To High
    Given Login With Credentials    ${VALID_USER}    ${PASSWORD}
    When Sort Products By Price Low To High
    Then Verify Products Sorted By Price Ascending

TC_003 - Remove Product From Cart
    Given Login With Credentials    ${VALID_USER}    ${PASSWORD}
    When Add Product To Cart And Go To Cart
    And Remove Product From Cart
    Then Verify Cart Is Empty And Badge Gone