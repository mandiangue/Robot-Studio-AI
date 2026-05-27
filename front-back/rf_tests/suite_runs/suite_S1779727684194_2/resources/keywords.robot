*** Settings ***
Suite Setup       Go To    ${url}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier BDD - SauceDemo
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779727684194_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779727684194_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()


Given The Login Page Is Open
    Open Login Page

When User Logs In With Locked Account
    Fill Username    ${LOCKED_USER}
    Fill Password    ${PASSWORD}
    Click Login Button

Then An Error Message Should Be Displayed For Locked User
    ${msg}=    Get Error Message Text
    Should Contain    ${msg}    Sorry, this user has been locked out

Given The User Is Logged In With Valid Account
    Open Login Page
    Fill Username    ${VALID_USER}
    Fill Password    ${PASSWORD}
    Click Login Button
    Wait Until Element Is Visible    css=.inventory_container    timeout=10s

When User Sorts Products By Price Low To High
    Select Sort Option By Value    lohi

Then Products Should Be Displayed In Ascending Price Order
    ${prices}=    Get All Product Prices As Numbers
    ${sorted}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted}

When User Adds First Product To Cart And Navigates To Cart
    Add First Product To Cart
    Navigate To Cart

When User Removes The Item From Cart
    Remove Item From Cart

Then The Cart Should Be Empty
    Cart Is Empty

And The Cart Badge Should Not Be Visible
    Cart Badge Is Not Visible