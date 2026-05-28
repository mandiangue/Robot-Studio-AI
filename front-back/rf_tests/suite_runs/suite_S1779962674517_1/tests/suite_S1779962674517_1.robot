*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--headless=new");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage");add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic");
Suite Teardown    Close Browser
Documentation      Test Suite for SauceDemo application
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779962674517_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779962674517_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Login With Valid Credentials
    Given Login With Valid Credentials
    Then Verify Successful Login

TC_002 — Login With Invalid Credentials
    Given Login With Invalid Credentials
    Then Verify Failed Login With Error Message

TC_003 — Add Product To Cart
    Given Login With Valid Credentials
    When Add First Product To Cart
    Then Verify Product Added To Cart

TC_004 — Sort Products By Price Low To High
    Given Login With Valid Credentials
    When Sort Products By Price Low To High
    Then Verify Products Are Sorted By Ascending Price