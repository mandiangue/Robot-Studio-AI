*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for Cdiscount E-commerce Platform
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Verify Access To Cdiscount Homepage
    [Documentation]    Test Case 001: Verify that the Cdiscount homepage loads correctly with all main elements visible
    [Tags]    homepage    smoke
    Given User Accesses Cdiscount Homepage
    When User Verifies Homepage Loads Correctly
    Then Cleanup Browser Session

TC_002 Perform Product Search
    [Documentation]    Test Case 002: Verify that product search returns correct results with product details
    [Tags]    search    functional
    Given User Accesses Cdiscount Homepage
    When User Searches For Product    ${PRODUCT_SEARCH_TERM}
    And User Verifies Search Results Appear
    Then Cleanup Browser Session

TC_003 Add Article To Cart
    [Documentation]    Test Case 003: Verify that a product can be added to cart with confirmation message
    [Tags]    cart    functional
    Given User Accesses Cdiscount Homepage
    When User Searches For Product    ${PRODUCT_SEARCH_TERM}
    And User Selects First Product From Results
    And User Adds Product To Cart
    Then User Verifies Product Added To Cart
    And Cleanup Browser Session