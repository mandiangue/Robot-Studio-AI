*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for Saucedemo Application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials And Verify Success
    [Documentation]    TC_001 — User logs in with valid credentials and is redirected to home page with products and welcome message displayed

    Login With Valid Credentials
    Verify Login Success And Products Displayed


TC_002 Add Multiple Products To Cart And Verify Count
    [Documentation]    TC_002 — User adds 3 different products to cart and verifies cart badge shows 3 with correct items present

    Login With Valid Credentials
    Add Multiple Products To Cart    3
    Verify Cart Badge Count    3
    Verify Products Added To Cart    3


TC_003 Sort Products By Price Low To High And Verify Order
    [Documentation]    TC_003 — User selects price low to high sort option and verifies products are reordered in ascending price order

    Login With Valid Credentials
    Sort Products By Price Low To High
    Verify Products Sorted By Price Ascending