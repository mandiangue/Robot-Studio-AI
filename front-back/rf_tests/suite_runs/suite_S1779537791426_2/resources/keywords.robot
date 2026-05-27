*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for SauceDemo tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779537791426_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779537791426_2/resources/pages/login_page.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779537791426_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

Given User Opens The Login Page

    Maximize Browser Window
    Wait Until Page Contains    Swag Labs    timeout=10s

When User Enters Valid Credentials
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

When User Enters Invalid Credentials
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}

When User Clicks The Login Button
    Click Login Button

Then User Is Redirected To Home Page
    Wait Until Page Contains    Products    timeout=10s
    Verify Product List Is Displayed

Then Error Message Is Displayed For Invalid Credentials
    Verify Error Message Is Displayed

When User Adds First Product To Cart
    Click Add To Cart Button

Then Product Appears In Cart And Badge Shows One Item
    Verify Cart Badge Shows Item Count    1

When User Selects Sort By Price Low To High
    Select Sort Option    ${SORT_PRICE_LOW_TO_HIGH}

Then Products Are Displayed In Ascending Price Order
    Verify Products Are Sorted By Price Ascending

And User Closes The Browser