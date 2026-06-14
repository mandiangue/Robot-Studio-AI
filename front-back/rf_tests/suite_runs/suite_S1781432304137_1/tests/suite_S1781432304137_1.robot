*** Settings ***
Suite Setup    Register Keyword To Run On Failure    Capture Page Screenshot
Documentation    SauceDemo end-to-end tests
Library    SeleniumLibrary
Resource    ../resources/variables.robot
Resource    ../resources/keywords.robot



*** Test Cases ***
TC_001 Login With Locked Out User
    [Documentation]    Verify locked out user cannot login
    [Tags]    TC_101
    Open Login Page
    Login As Locked User
    Verify Locked Out Error Displayed

TC_002 Sort Products By Price Descending
    [Documentation]    Verify products are sorted by price high to low
    [Tags]    TC_102
    Open Login Page
    Login As Standard User
    Sort Products By Price High To Low
    Verify Products Are Sorted Descending By Price

TC_003 Add Multiple Items To Cart
    [Documentation]    Verify three products can be added to cart
    [Tags]    TC_103
    Open Login Page
    Login As Standard User
    Add Three Products To Cart
    Open Cart Page
    Verify Cart Contains Three Items

TC_004 Complete Checkout With Valid Information
    [Documentation]    Verify successful order completion
    [Tags]    TC_104
    Open Login Page
    Login As Standard User
    Add One Product To Cart
    Proceed To Checkout
    Complete Checkout Form
    Finalize Order
    Verify Order Success