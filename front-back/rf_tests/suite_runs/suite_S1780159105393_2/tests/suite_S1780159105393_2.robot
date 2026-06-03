*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--headless=new");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage");add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic");
Suite Teardown    Close Browser
Documentation    Tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780159105393_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780159105393_2/resources/keywords.robot



*** Test Cases ***
TC_001 — Login With Locked User Account

    When User Logs In With Locked Account
    Then Error Message Should Show User Is Locked Out

TC_002 — Sort Products By Price Low To High
    Given User Is Logged In With Valid Account
    When User Selects Price Low To High Sort
    Then Products Should Be Sorted By Price Low To High

TC_003 — Remove Item From Cart
    Given User Is Logged In With Valid Account
    When User Adds First Product To Cart And Navigates To Cart
    When User Removes The Item From Cart
    Then Cart Should Be Empty And Badge Should Disappear