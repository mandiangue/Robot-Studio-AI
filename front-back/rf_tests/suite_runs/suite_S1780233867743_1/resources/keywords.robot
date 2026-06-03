*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    Open Browser    ${url}    ${browser}    options=add_argument("--incognito");add_argument("--disable-notifications");add_argument("--disable-save-password-bubble");add_argument("--disable-infobars");add_argument("--disable-popup-blocking");add_argument("--disable-features=PasswordManagerEnabled,TranslateUI,AutofillServerCommunication,PasswordLeakDetection,SavePasswordsBubble");add_argument("--no-first-run");add_argument("--no-default-browser-check");add_argument("--password-store=basic");add_argument("--user-data-dir=C:/Users/Landing/AppData/Local/Temp/chrome_rf_1780233877792");add_experimental_option("prefs",{"credentials_enable_service":false,"profile.password_manager_enabled":false,"profile.password_manager_leak_detection":false,"profile.default_content_setting_values.notifications":2,"profile.default_content_settings.popups":0,"autofill.profile_enabled":false,"autofill.credit_card_enabled":false});add_experimental_option("excludeSwitches",["enable-automation","enable-logging"])

Dismiss Password Popup
    [Documentation]    Ferme le popup Chrome "modifier mot de passe" sil apparait
    ${present}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//div[@role="dialog"]//button[contains(@jsname,"")]
    Run Keyword If    ${present}    Press Keys    None    ESCAPE
    Sleep    0.2s
    Execute Javascript    document.activeElement.blur()

Input Password Field
    [Arguments]    ${locator}    ${value}
    Input Text    ${locator}    ${value}
    Dismiss Password Popup



Given The Login Page Is Open
    Open Login Page

When User Logs In With Locked Account
    Fill Login Form    ${LOCKED_USER}    ${PASSWORD}

Then An Error Message Should Be Displayed For Locked User
    Error Message Is Visible
    Error Message Contains Locked Text

Given The User Is Logged In As Standard User
    Open Login Page
    Fill Login Form    ${STANDARD_USER}    ${PASSWORD}

Then The Products Page Should Be Loaded
    Products Page Is Loaded

When User Selects Sort By Price Low To High
    Select Sort Option    lohi

Then Products Should Be Sorted By Price Ascending
    Products Are Sorted By Price Ascending

When User Adds First Product To Cart
    Add First Product To Cart

When User Navigates To Cart
    Go To Cart

When User Removes The Item From Cart
    Remove Item From Cart

Then The Cart Should Be Empty
    Cart Is Empty

Then The Cart Badge Should Not Be Visible
    Cart Badge Is Not Visible