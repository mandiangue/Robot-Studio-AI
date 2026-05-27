*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business Keywords for SauceDemo tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779535182207_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779535182207_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

Given User Opens The Login Page
    Open Login Page

When User Enters Valid Credentials
    Enter Username    ${STANDARD_USER}
    Enter Password    ${PASSWORD}

When User Clicks The Login Button
    Click Login Button

Then User Is Authenticated And Redirected To Products Page
    Verify Products Page Is Displayed

When User Adds Sauce Labs Backpack To Cart
    Click Add To Cart For Backpack

Then Item Is Added To Cart With Badge And Remove Button
    Verify Item Added To Cart

When User Clicks The Cart Icon
    Click Cart Icon

Then Cart Page Is Displayed With Item Details
    Verify Cart Page Is Displayed
    Verify Item Details In Cart

And Checkout Button Is Available
    Verify Checkout Button Is Visible

When User Enters Invalid Username And Password
    Enter Username    ${INVALID_USER}
    Enter Password    ${INVALID_PASSWORD}

Then Error Message Is Displayed Indicating Invalid Credentials
    Verify Error Message Is Displayed

And User Closes The Browser