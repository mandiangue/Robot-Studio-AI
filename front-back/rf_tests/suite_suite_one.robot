*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login Application Test Cases
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials

    When User Enters Valid Username And Valid Password
    And User Clicks The Login Button
    Then User Should See Success Login Message


TC_002 Failed Login With Invalid Password

    When User Enters Valid Username And Invalid Password
    And User Clicks The Login Button
    Then User Should See Invalid Password Error Message
    And User Should Remain On Login Page


TC_003 Failed Login With Invalid Username

    When User Enters Invalid Username And Valid Password
    And User Clicks The Login Button
    Then User Should See Invalid Username Error Message
    And User Should Remain On Login Page



*** Test Cases ***
TC_001 Authentication With Valid Credentials

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Should Be Authenticated And Redirected To Products Page
    And User Should See Products List


TC_002 Add Product To Cart

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Should Be Authenticated And Redirected To Products Page
    When User Adds First Product To Cart
    Then Product Should Be Added To Cart
    And Cart Badge Should Appear With Item Count


TC_003 Access Cart And Verify Items

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Should Be Authenticated And Redirected To Products Page
    When User Adds First Product To Cart
    Then Product Should Be Added To Cart
    When User Clicks On Cart Icon
    Then Cart Page Should Be Displayed With Added Product
    And Product Price Should Be Visible In Cart
    And Total Price Should Be Calculated Correctly
