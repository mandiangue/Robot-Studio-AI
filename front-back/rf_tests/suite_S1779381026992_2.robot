*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test cases for Sauce Demo e-commerce platform
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Is Redirected To Products Page


TC_002 Add Product To Cart

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Is Redirected To Products Page
    When User Adds First Product To Cart
    Then Product Is Added To Cart With Badge Count One
    And Button Changes From Add To Remove


TC_003 Access Cart And Verify Content

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Is Redirected To Products Page
    When User Adds First Product To Cart
    And User Clicks Cart Icon
    Then Cart Page Is Displayed
    And Product Is Visible In Cart
    And Cart Total Price Is Correctly Calculated
