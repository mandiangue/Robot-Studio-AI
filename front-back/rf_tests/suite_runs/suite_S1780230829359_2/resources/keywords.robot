*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    Open Browser    ${url}    ${browser}    options=add_argument("--incognito");add_argument("--disable-notifications");add_argument("--disable-save-password-bubble");add_argument("--disable-infobars");add_argument("--disable-popup-blocking");add_argument("--disable-features=PasswordManagerEnabled,TranslateUI,AutofillServerCommunication,PasswordLeakDetection,SavePasswordsBubble");add_argument("--no-first-run");add_argument("--no-default-browser-check");add_argument("--password-store=basic");add_argument("--user-data-dir=C:/Users/Landing/AppData/Local/Temp/chrome_rf_1780230858118");add_experimental_option("prefs",{"credentials_enable_service":false,"profile.password_manager_enabled":false,"profile.password_manager_leak_detection":false,"profile.default_content_setting_values.notifications":2,"profile.default_content_settings.popups":0,"autofill.profile_enabled":false,"autofill.credit_card_enabled":false});add_experimental_option("excludeSwitches",["enable-automation","enable-logging"])

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

When User Enters Valid Credentials
    Enter Username    ${USERNAME}
    Enter Password    ${PASSWORD}

When User Enters Wrong Password
    Enter Username    ${USERNAME}
    Enter Password    ${WRONG_PASSWORD}

When User Enters Wrong Username
    Enter Username    ${WRONG_USERNAME}
    Enter Password    ${PASSWORD}

When User Clicks Login Button
    Click Login Button

Then User Should See Success Message
    Verify Success Message

Then User Should See Wrong Password Error
    Verify Wrong Password Message

Then User Should See Wrong Username Error
    Verify Wrong Username Message

Then User Should Be Redirected To Login Page
    Verify Login Page Is Displayed

When User Clicks Logout Button
    Click Logout Button

Then User Should See Logout Confirmation
    Verify Logout Message