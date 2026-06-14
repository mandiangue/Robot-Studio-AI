*** Settings ***
Test Teardown    Run Keywords    Capture Page Screenshot    AND    Close Browser
Suite Setup    Register Keyword To Run On Failure    Capture Page Screenshot
Documentation    Tests Main - SauceDemo end-to-end scenarios
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1781260885017_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1781260885017_1/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Locked Out User
    [Documentation]    Attempt login with locked_out_user
    Given User Is On Login Page
    When User Logs In With    ${LOCKED_USER}    ${PASSWORD}
    Then Locked Out Error Is Displayed

TC_002 Sort Products By Price High To Low
    [Documentation]    Sort inventory by price descending
    Given User Is Logged In As Standard User
    When User Sorts Products By Price High To Low
    Then Products Are Sorted From Highest To Lowest Price

TC_003 Add Multiple Products To Cart
    [Documentation]    Add three products and verify cart
    Given User Is Logged In As Standard User
    When User Adds Three Products To Cart
    Then Cart Badge Shows    3
    And Three Products Are Visible In Cart

TC_004 Remove Product From Cart
    [Documentation]    Remove a product from the cart
    Given User Is Logged In As Standard User
    When User Adds One Product To Cart
    And User Opens The Cart
    And User Removes The Product From Cart
    Then Cart Badge Is Not Visible

TC_005 Complete Order Checkout
    [Documentation]    Finalize a full purchase
    Given User Is Logged In As Standard User
    When User Adds One Product To Cart
    And User Opens The Cart
    When User Proceeds To Checkout
    And User Fills Checkout Information    John    Doe    12345
    And User Finishes The Order
    Then Order Confirmation Is Displayed

TC_006 Logout From Side Menu
    [Docum