*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for Sauce Demo Application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials

    When User Enters Username And Password
    And User Clicks Login Button
    Then User Is Redirected To Home Page With Products

TC_002 Add Product To Cart
    Given User Is Logged In And On Home Page
    When User Clicks Add To Cart Button For Sauce Labs Backpack
    Then Product Is Added To Cart And Button Changes To Remove
    And Cart Badge Displays Number One

TC_003 Access Cart And Verify Product
    Given User Is Logged In And On Home Page
    When User Clicks Add To Cart Button For Sauce Labs Backpack
    And User Clicks On Cart Icon
    Then Cart Page Is Displayed With Added Product
    And Continue Shopping And Checkout Buttons Are Visible