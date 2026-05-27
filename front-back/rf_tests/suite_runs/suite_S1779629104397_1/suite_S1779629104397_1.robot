*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Test Cases for SauceDemo Application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629104397_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629104397_1/resources/keywords.robot

*** Test Cases ***
TC_SAUCEDEMO_001 Login With Valid Credentials
    [Documentation]    User logs in with valid credentials and is redirected to products page

    When User Enters Valid Credentials And Logs In
    Then User Is Authenticated And Products List Is Displayed


TC_SAUCEDEMO_002 Add Product To Cart And Verify Badge Count
    [Documentation]    User adds a product to cart and verifies the badge shows correct item count

    When User Enters Valid Credentials And Logs In
    And User Adds First Product To Shopping Cart
    Then Shopping Cart Badge Shows One Article


TC_SAUCEDEMO_003 Sort Products By Price Low To High
    [Documentation]    User sorts products by price from lowest to highest and verifies the order

    When User Enters Valid Credentials And Logs In
    When User Selects Sort Option From Lowest To Highest Price
    Then Products Are Displayed In Ascending Price Order
