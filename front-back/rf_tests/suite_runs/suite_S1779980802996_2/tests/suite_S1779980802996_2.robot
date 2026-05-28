*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests SauceDemo - TC_001 TC_002 TC_003
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779980802996_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779980802996_2/resources/keywords.robot



*** Test Cases ***
TC_001 - Login With Locked User Account
    [Documentation]    Attempt to login with locked_out_user and verify error message is displayed
    Given Login As Locked User
    Then Verify Locked User Error Message

TC_002 - Sort Products By Ascending Price
    [Documentation]    Login with valid account, sort products by price low to high and verify order
    Given Login As Valid User
    When Sort Products By Price Low To High
    Then Verify Products Sorted By Price Ascending

TC_003 - Remove Product From Cart
    [Documentation]    Login, add a product to cart, navigate to cart and remove the product
    Given Login As Valid User
    When Add Product To Cart And Go To Cart
    Then Remove Product And Verify Cart Empty