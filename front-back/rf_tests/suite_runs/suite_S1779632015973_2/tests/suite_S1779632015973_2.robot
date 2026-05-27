*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo — Login, Cart and Logout scenarios
Library           SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779632015973_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779632015973_2/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    [Documentation]    Access saucedemo.com, enter username standard_user and password secret_sauce,
    ...                click Login button and verify redirection to the products page.

    When Enter Valid Credentials
    And Submit Login Form
    Then Products Page Should Be Displayed

TC_002 — Add A Product To Cart From Catalogue Page
    [Documentation]    After login on saucedemo.com, click Add to cart on the first visible product
    ...                and verify the cart badge increments to 1 and the button changes to Remove.

    And Enter Valid Credentials
    And Submit Login Form
    And Products Page Should Be Displayed
    When Add First Product To Cart
    Then Cart Badge Should Show One Item
    And First Product Button Should Be Remove

TC_003 — Logout Via Burger Side Menu
    [Documentation]    After login on saucedemo.com, open the burger menu and click Logout,
    ...                then verify redirection to login page and that protected pages are inaccessible.

    And Enter Valid Credentials
    And Submit Login Form
    And Products Page Should Be Displayed
    When Open Side Menu
    And Logout From Application
    Then Login Page Should Be Displayed
    And Protected Page Should Not Be Accessible Without Login