*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for Saucedemo Application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540564412_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540564412_2/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials

    When User Enters Valid Username And Password
    And User Clicks The Login Button
    Then User Is Redirected To Inventory Page
    And User Sees The Products List


TC_002 Add Product To Cart

    When User Enters Valid Username And Password
    And User Clicks The Login Button
    And User Waits For Page Load
    When User Clicks Add To Cart For First Product
    Then Product Is Added To Cart And Badge Shows
    And Add To Cart Button Is Changed To Remove


TC_003 Login With Invalid Credentials

    When User Enters Invalid Username And Password
    And User Clicks The Login Button
    Then Error Message Is Displayed With Text    Epic sadface: Username and password do not match any user in this service


TC_004 Verify Products Sort By Price Low To High

    When User Enters Valid Username And Password
    And User Clicks The Login Button
    And User Waits For Page Load
    When User Selects Sort Option Price Low To High
    Then Products Are Displayed Sorted By Price From Low To High