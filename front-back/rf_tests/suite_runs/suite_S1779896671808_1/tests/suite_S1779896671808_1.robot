*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--headless=new");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage");add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic");
Suite Teardown    Close Browser
Documentation    Tests TC_007 TC_008 TC_009
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779896671808_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779896671808_1/resources/keywords.robot



*** Test Cases ***
TC_007 - Sort Products By Price Low To High
    Given Login With Valid User
    When Sort Products By Price Low To High
    Then Page Should Contain Element    ${SORT_DROPDOWN}

TC_008 - Remove Item From Cart
    Given Login With Valid User
    And Add Product To Cart And Go To Cart
    When Remove Item From Cart
    Then Verify Cart Is Empty After Removal

TC_009 - Complete Order Checkout
    Given Login With Valid User
    And Add Product To Cart And Go To Cart
    And Proceed To Checkout And Fill Information    John    Doe    75001
    Then Confirm Order And Verify Success