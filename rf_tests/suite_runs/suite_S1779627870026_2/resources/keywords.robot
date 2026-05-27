*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for SauceDemo — Keyword-Driven style
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627870026_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627870026_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page


Login With Valid Credentials
    Fill Login Form    ${USERNAME}    ${PASSWORD}
    Submit Login Form
    Verify Products Page Is Displayed

Add Product To Cart And Verify Badge
    Click Add To Cart Button
    Verify Cart Badge Shows    1
    Verify Remove Button Is Displayed

Sort Products By Price Low To High And Verify Order
    Select Sort Option By Price Low To High
    Verify Products Are Sorted By Price Ascending

Logout Via Burger Menu And Verify Login Page
    Open Burger Menu
    Click Logout Link
    Verify Login Page Is Displayed

Close Test Browser