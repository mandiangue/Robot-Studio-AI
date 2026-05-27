*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for Cdiscount Website
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Search Product Via Search Bar
    [Documentation]    Verify product search functionality displays results with filters
    Navigate To Cdiscount
    Search Product With Query    ${SEARCH_QUERY}
    Verify Search Results Are Available


TC_002 Add Product To Shopping Cart
    [Documentation]    Verify adding a product to cart shows confirmation and updates cart count
    Navigate To Cdiscount
    Search Product With Query    ${SEARCH_QUERY}
    Add Product To Cart From Results
    Verify Product Added To Cart Successfully


TC_003 Access User Login Page
    [Documentation]    Verify accessing login page displays email, password fields and create account link
    Navigate To Cdiscount
    Access User Login Page
    Verify Login Page Is Displayed Correctly
