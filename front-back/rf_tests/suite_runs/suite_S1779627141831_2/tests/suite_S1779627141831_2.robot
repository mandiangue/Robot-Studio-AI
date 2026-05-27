*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo — TC_SAUCE_007, TC_SAUCE_008, TC_SAUCE_009
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627141831_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627141831_2/resources/keywords.robot

*** Test Cases ***
TC_SAUCE_007 — Sort Products By Price Low To High
    [Documentation]    After login with standard_user, access the inventory page and use the sort
    ...                dropdown to select 'Price (low to high)'. Verify products are reordered
    ...                from lowest to highest price.
    [Tags]    sorting    inventory    TC_SAUCE_007

    And Enter Valid Credentials
    When Submit Login Form
    Then Verify User Is On Inventory Page
    When Select Price Low To High Sort Option
    Then Verify Products Are Sorted By Price Low To High


TC_SAUCE_008 — Remove An Item From The Cart
    [Documentation]    After login with standard_user, add a product to the cart from the inventory
    ...                page, navigate to the cart, then click 'Remove'. Verify the cart is empty
    ...                and the cart badge counter is gone.
    [Tags]    cart    remove    TC_SAUCE_008

    And Enter Valid Credentials
    When Submit Login Form
    Then Verify User Is On Inventory Page
    When Add A Product To The Cart
    Then Verify Cart Badge Displays One Item
    When Navigate To Cart Page
    And Remove The Item From The Cart
    Then Verify Cart Is Now Empty


TC_SAUCE_009 — Logout Via Burger Menu
    [Documentation]    After login with standard_user, click the hamburger menu, then click 'Logout'.
    ...                Verify the user is redirected to the login page with empty username
    ...                and password fields.
    [Tags]    logout    navigation    TC_SAUCE_009

    And Enter Valid Credentials
    When Submit Login Form
    Then Verify User Is On Inventory Page
    When Open Burger Menu
    And Click On Logout
    Then Verify User Is Redirected To Login Page