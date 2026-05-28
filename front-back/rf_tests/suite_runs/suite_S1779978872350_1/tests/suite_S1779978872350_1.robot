*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779978872350_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779978872350_1/resources/keywords.robot



*** Test Cases ***
TC_007 - Sort Products By Price Low To High
    Given Log In With Valid Credentials
    When Sort Products By Price Low To High
    Then Verify Products Are Sorted By Price Ascending

TC_008 - Remove Item From Cart
    Given Log In With Valid Credentials
    And Add Product To Cart And Verify Badge
    When Go To Cart Page
    And Remove Product From Cart
    Then Verify Cart Is Now Empty

TC_009 - Logout From Side Menu
    Given Log In With Valid Credentials
    When Open Side Menu And Logout
    Then Verify User Is Redirected To Login Page
    And Verify Login Fields Are Empty