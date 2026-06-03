*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    Open Browser    ${url}    ${browser}    options=add_argument("--incognito");add_argument("--disable-notifications");add_argument("--disable-save-password-bubble");add_argument("--disable-infobars");add_argument("--disable-popup-blocking");add_argument("--disable-features=PasswordManagerEnabled,TranslateUI,AutofillServerCommunication,PasswordLeakDetection,SavePasswordsBubble");add_argument("--no-first-run");add_argument("--no-default-browser-check");add_argument("--password-store=basic");add_argument("--user-data-dir=C:/Users/Landing/AppData/Local/Temp/chrome_rf_1780237641618");add_experimental_option("prefs",{"credentials_enable_service":false,"profile.password_manager_enabled":false,"profile.password_manager_leak_detection":false,"profile.default_content_setting_values.notifications":2,"profile.default_content_settings.popups":0,"autofill.profile_enabled":false,"autofill.credit_card_enabled":false});add_experimental_option("excludeSwitches",["enable-automation","enable-logging"])

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

When User Logs In With Locked Account
    Enter Username    ${LOCKED_USER}
    Enter Password    ${PASSWORD}
    Click Login Button

Then Error Message Should Indicate Account Is Locked
    ${msg}=    Get Error Message Text
    Should Be Equal As Strings    ${msg}    ${LOCKED_ERROR_MSG}

When User Logs In With Standard Account
    Enter Username    ${STANDARD_USER}
    Enter Password    ${PASSWORD}
    Click Login Button

When User Selects Sort By Price Low To High
    Select Sort Option    lohi

Then Products Should Be Sorted By Price Ascending
    ${prices}=    Get All Product Prices
    ${sorted}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted}

When User Adds First Product To Cart
    Click First Add To Cart Button

And User Navigates To Cart Page
    Go To Cart Page

When User Removes The Item From Cart
    Click Remove Button In Cart

Then Cart Should Be Empty And Badge Should Disappear
    Cart Badge Should Not Be Visible
    Cart Should Be Empty