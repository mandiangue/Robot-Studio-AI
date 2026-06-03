*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    Open Browser    ${url}    ${browser}    options=add_argument("--incognito");add_argument("--disable-notifications");add_argument("--disable-save-password-bubble");add_argument("--disable-infobars");add_argument("--disable-popup-blocking");add_argument("--disable-features=PasswordManagerEnabled,TranslateUI,AutofillServerCommunication,PasswordLeakDetection,SavePasswordsBubble");add_argument("--no-first-run");add_argument("--no-default-browser-check");add_argument("--password-store=basic");add_argument("--user-data-dir=C:/Users/Landing/AppData/Local/Temp/chrome_rf_1780235368712");add_experimental_option("prefs",{"credentials_enable_service":false,"profile.password_manager_enabled":false,"profile.password_manager_leak_detection":false,"profile.default_content_setting_values.notifications":2,"profile.default_content_settings.popups":0,"autofill.profile_enabled":false,"autofill.credit_card_enabled":false});add_experimental_option("excludeSwitches",["enable-automation","enable-logging"])

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



Given Open Login Page
    Open Login Page

When User Attempts Login With Locked Account
    Fill Username    ${LOCKED_USER}
    Fill Password    ${PASSWORD}
    Click Login Button

Then Locked Error Message Should Be Displayed
    Verify Locked Error Message Is Displayed

Given User Is Logged In As Standard User
    Open Login Page
    Fill Username    ${STANDARD_USER}
    Fill Password    ${PASSWORD}
    Click Login Button
    Wait Until Element Is Visible    css=.inventory_list    timeout=10s

When User Sorts Products By Price Ascending
    Select Sort Option By Price Ascending

Then Products Should Be Sorted By Price Ascending
    Verify Products Are Sorted By Price Ascending

When User Adds First Product To Cart And Opens Cart
    Add First Product To Cart
    Go To Cart

When User Removes The Item From Cart
    Remove Item From Cart

Then Cart Should Be Empty
    Verify Cart Is Empty