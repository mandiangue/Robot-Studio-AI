*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests Saucedemo - 6 cas de test
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780158379508_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780158379508_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Login With Locked Out User

    When Login With Locked User
    Then Error Message For Locked User Is Displayed

TC_002 — Sort Products By Price Ascending After Login

    When Login With Standard User
    Then User Is Redirected To Inventory Page
    When User Sorts Products By Price Low To High
    Then Products Are Displayed In Ascending Price Order

TC_003 — Remove Product From Cart After Login

    When Login With Standard User
    Then User Is Redirected To Inventory Page
    When User Adds First Product To Cart
    And User Goes To Cart
    When User Removes Product From Cart
    Then Cart Is Empty

TC_004 — Sort Products By Price Ascending Page Two

    When Login With Standard User
    Then User Is Redirected To Inventory Page
    When User Sorts Products By Price Low To High
    Then Products Are Displayed In Ascending Price Order

TC_005 — Remove Product From Cart Page Two

    When Login With Standard User
    Then User Is Redirected To Inventory Page
    When User Adds First Product To Cart
    And User Goes To Cart
    When User Removes Product From Cart
    Then Cart Is Empty

TC_006 — Complete Full Order Checkout

    When Login With Standard User
    Then User Is Redirected To Inventory Page
    When User Adds First Product To Cart
    And User Goes To Cart
    When User Clicks Checkout
    And User Fills Checkout Information
    And User Clicks Continue
    And User Clicks Finish
    Then Order Confirmation Is Displayed