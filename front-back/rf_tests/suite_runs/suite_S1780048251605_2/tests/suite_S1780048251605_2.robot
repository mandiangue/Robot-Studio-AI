*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests SauceDemo
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780048251605_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780048251605_2/resources/keywords.robot



*** Test Cases ***
TC_001 — Login With Locked Out User
    Given Login With Locked Out User
    Then Verify Locked Out Error Is Displayed

TC_002 — Sort Products By Price Low To High
    Given Login With Standard User
    When Sort Products By Price Low To High
    Then Verify Products Are Sorted By Price Ascending

TC_003 — Logout From Burger Menu
    Given Login With Standard User
    When Logout From Burger Menu
    Then Verify User Is On Login Page