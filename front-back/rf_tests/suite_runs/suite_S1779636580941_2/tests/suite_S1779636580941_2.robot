*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--headless=new");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage");add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic");
Suite Teardown    Close Browser
Documentation    Test Cases for Sauce Demo application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779636580941_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779636580941_2/resources/keywords.robot

*** Test Cases ***
TC_SAUCE_001 Login With Valid Credentials

    When User Enters Valid Credentials
    When User Clicks The Login Button
    Then User Should See The Product List


TC_SAUCE_002 Add Product To Cart

    When User Enters Valid Credentials
    When User Clicks The Login Button
    Then User Should See The Product List
    When User Selects A Product And Adds It To Cart
    Then The Product Should Appear In Cart With Correct Count
    Then The Product Price Should Be Visible


TC_SAUCE_003 Complete Payment Process

    When User Enters Valid Credentials
    When User Clicks The Login Button
    Then User Should See The Product List
    When User Selects A Product And Adds It To Cart
    When User Navigates To Cart
    When User Proceeds To Checkout
    When User Fills Delivery Information With Personal Data
    When User Clicks Continue Button
    When User Completes Payment Process
    Then Confirmation Message Should Be Displayed