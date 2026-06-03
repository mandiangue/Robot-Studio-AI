*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests SauceDemo - TC_001 TC_002 TC_003
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780150998746_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780150998746_2/resources/keywords.robot



*** Test Cases ***
TC_001 - Login With Locked User
    Given Login With Locked User
    Then Verify Locked User Cannot Access Application

TC_002 - Sort Products By Price Low To High
    Given Login With Standard User
    When Sort Products By Price Low To High
    Then Verify Products Are Sorted By Price Ascending

TC_003 - Remove Product From Cart
    Given Login With Standard User
    When Add Product To Cart And Navigate To Cart
    Then Remove Product From Cart And Verify Cart Is Empty