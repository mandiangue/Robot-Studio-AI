*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    Open Browser    ${url}    ${browser}    options=add_argument("--incognito");add_argument("--disable-notifications");add_argument("--disable-save-password-bubble");add_argument("--disable-infobars");add_argument("--disable-popup-blocking");add_argument("--disable-features=PasswordManagerEnabled,TranslateUI,AutofillServerCommunication,PasswordLeakDetection,SavePasswordsBubble");add_argument("--no-first-run");add_argument("--no-default-browser-check");add_argument("--password-store=basic");add_argument("--user-data-dir=C:/Users/Landing/AppData/Local/Temp/chrome_rf_1780233898953");add_experimental_option("prefs",{"credentials_enable_service":false,"profile.password_manager_enabled":false,"profile.password_manager_leak_detection":false,"profile.default_content_setting_values.notifications":2,"profile.default_content_settings.popups":0,"autofill.profile_enabled":false,"autofill.credit_card_enabled":false});add_experimental_option("excludeSwitches",["enable-automation","enable-logging"])

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

When The User Enters Valid Credentials
    Enter Username    ${USERNAME}
    Enter Password    ${PASSWORD}

When The User Enters Invalid Password
    Enter Username    ${USERNAME}
    Enter Password    ${WRONG_PASSWORD}

When The User Enters Invalid Username
    Enter Username    ${WRONG_USERNAME}
    Enter Password    ${PASSWORD}

When The User Clicks The Login Button
    Click Login Button

Then The User Should See The Success Message
    Verify Success Message

Then The User Should See The Wrong Password Error
    Verify Wrong Password Message

Then The User Should See The Wrong Username Error
    Verify Wrong Username Message

When The User Clicks The Logout Button
    Click Logout Button

Then The User Should See The Logout Confirmation Message
    Verify Logout Message

Then The User Should Be Redirected To The Login Page
    Verify Redirected To Login Page