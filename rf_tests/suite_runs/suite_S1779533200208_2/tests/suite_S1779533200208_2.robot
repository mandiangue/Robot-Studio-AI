*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test cases for SauceDemo application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533200208_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533200208_2/resources/keywords.robot

*** Test Cases ***
TC_001 User Login With Valid Credentials
    [Documentation]    User connects to saucedemo with valid credentials and is redirected to home page

    Perform Login With Valid Credentials
    Verify Products Page Is Displayed


TC_002 Add Product To Cart
    [Documentation]    Connected user clicks Add to Cart button for a product and cart is updated

    Perform Login With Valid Credentials
    Add First Product To Cart
    Verify Product Is Added To Cart


TC_003 Validate Product Sort By Price
    [Documentation]    Connected user selects price sorting option and products are reorganized from lowest to highest price

    Perform Login With Valid Credentials
    Sort Products By Price Low To High
    Verify Products Are Correctly Sorted By Price