*** Settings ***
Suite Setup    Register Keyword To Run On Failure    Capture Page Screenshot
Documentation    Tests Main
Library    SeleniumLibrary
Resource    ../resources/variables.robot
Resource    ../resources/keywords.robot



*** Test Cases ***
TC_001 Login With Problem User
    [Documentation]    Login with problem_user and verify inventory page is displayed
    Login As Problem User

TC_002 Sort Products By Price High To Low
    [Documentation]    Sort products by price descending
    Login As Standard User
    Sort Products By Price High To Low
    Verify Products Sorted High To Low

TC_003 Remove Item From Cart
    [Documentation]    Add backpack and remove it from cart
    Login As Standard User
    Add Product To Cart And Open Cart
    Remove Backpack From Cart
    Verify Cart Badge Not Visible

TC_004 Side Menu And Logout
    [Documentation]    Verify burger menu logout returns to login page
    Login As Standard User
    Logout From Application
    Verify Login Page Displayed

TC_005 Finalize Order With Valid Information
    [Documentation]    Complete checkout with valid information
    Login As Standard User
    Add Product To Cart And Open Cart
    Complete Checkout With Information    John    Doe    12345
    Verify Order Confirmation Displayed

TC_006 Required Fields Validation On Checkout
    [Documentation]    Verify error message when checkout fields are empty
    Login As Standard User
    Add Product To Cart And Open Cart
    Submit Empty Checkout Form
    Verify First Name Error Displayed