*** Settings ***


Documentation     SauceDemo end-to-end test suite
Library           Browser
Resource          ../resources/variables.robot
Resource          ../resources/keywords.robot
Resource          ../resources/pages/main_page.robot

*** Test Cases ***
TC_001 Login With Problem User
    [Documentation]    Login with problem_user and verify inventory page
    Given Login With User    ${PROBLEM_USER}    ${PASSWORD}
    When Verify Inventory Page Displayed
    Then Verify Product Images Present

TC_002 Sort Products By Price High To Low
    [Documentation]    Sort products and verify order
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Verify Inventory Page Displayed
    When Select Sort Option    hilo
    Then Verify Products Sorted High To Low

TC_003 Remove Product From Cart Page
    [Documentation]    Remove product from cart and check badge
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Add First Product To Cart

    And Remove Product From Cart
    Then Verify Cart Badge Not Visible

TC_004 Checkout Required Fields Validation
    [Documentation]    Submit checkout without required fields
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Add First Product To Cart

    When Go To Checkout
    And Click Continue On Checkout
    Then Verify Error Message Displayed    First Name is required

TC_005 Complete Order Successfully
    [Documentation]    Finalize an order successfully
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Add First Product To Cart

    And Go To Checkout
    When Fill Checkout Information    ${FIRST_NAME}    ${LAST_NAME}    ${POSTAL_CODE}
    And Click Continue On Checkout
    And Finish Order
    Then Verify Order Confirmation

TC_006 Logout From Side Menu
    [Documentation]    Logout via hamburger menu
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Verify Inventory Page Displayed
    When Open Side Menu
    And Click Logout
    Then Verify Login Page Displayed