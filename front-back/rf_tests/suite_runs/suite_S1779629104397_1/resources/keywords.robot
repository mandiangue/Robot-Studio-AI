*** Settings ***
Documentation    Business keywords for SauceDemo tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629104397_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629104397_1/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Given User Opens The SauceDemo Application
    [Documentation]    User opens the SauceDemo application
    Open SauceDemo Application

When User Enters Valid Credentials And Logs In
    [Documentation]    User enters valid username and password and clicks login
    Enter Username In Login Form    ${VALID_USERNAME}
    Enter Password In Login Form    ${VALID_PASSWORD}
    Click Login Button

Then User Is Authenticated And Products List Is Displayed
    [Documentation]    Verifies that user is authenticated and products list is visible
    Verify Products List Is Displayed

When User Adds First Product To Shopping Cart
    [Documentation]    User adds the first product to the shopping cart
    Add First Product To Cart

Then Shopping Cart Badge Shows One Article
    [Documentation]    Verifies that shopping cart badge displays 1 article
    Verify Cart Badge Shows Item Count    1

When User Selects Sort Option From Lowest To Highest Price
    [Documentation]    User selects the sort dropdown option for lowest to highest price
    Select Sort Option By Price Low To High

Then Products Are Displayed In Ascending Price Order
    [Documentation]    Verifies that products are sorted in ascending order by price
    Verify Products Are Sorted By Price Low To High

And Application Is Closed
    [Documentation]    Closes the application
    Close SauceDemo Application