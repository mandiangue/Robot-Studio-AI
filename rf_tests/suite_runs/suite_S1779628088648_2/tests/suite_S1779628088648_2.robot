*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo — covers cart, sorting and logout scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779628088648_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779628088648_2/resources/keywords.robot


*** Test Cases ***
TC_001 — Add A Product To The Cart
    [Documentation]    Login with valid credentials, add a product to the cart,
    ...                verify the cart badge shows 1 and the button changes to Remove.
    [Tags]    cart    smoke

    When Login With Valid Credentials
    And Add Product To Cart And Verify Badge

TC_002 — Sort Products By Price Low To High
    [Documentation]    Login with valid credentials, select the sort option
    ...                Price (low to high) and verify the products are ordered
    ...                from the lowest price to the highest.
    [Tags]    sorting    smoke

    When Login With Valid Credentials
    And Sort Products By Price Low To High And Verify Order

TC_003 — Logout Via Burger Menu
    [Documentation]    Login with valid credentials, open the burger menu,
    ...                click Logout and verify the login page is displayed again.
    [Tags]    logout    smoke

    When Login With Valid Credentials
    And Logout Via Burger Menu And Verify Login Page