*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    Open Browser    ${url}    ${browser}    options=add_argument("--incognito");add_argument("--disable-notifications");add_argument("--disable-save-password-bubble");add_argument("--disable-infobars");add_argument("--disable-popup-blocking");add_argument("--disable-features=PasswordManagerEnabled,TranslateUI,AutofillServerCommunication,PasswordLeakDetection,SavePasswordsBubble");add_argument("--no-first-run");add_argument("--no-default-browser-check");add_argument("--password-store=basic");add_argument("--user-data-dir=C:/Users/Landing/AppData/Local/Temp/chrome_rf_1780237660378");add_experimental_option("prefs",{"credentials_enable_service":false,"profile.password_manager_enabled":false,"profile.password_manager_leak_detection":false,"profile.default_content_setting_values.notifications":2,"profile.default_content_settings.popups":0,"autofill.profile_enabled":false,"autofill.credit_card_enabled":false});add_experimental_option("excludeSwitches",["enable-automation","enable-logging"])

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



Given User Is On The Login Page
    Open Login Page

When User Enters Valid Credentials
    Enter Username    ${USERNAME}
    Enter Password    ${PASSWORD}

When User Enters Invalid Password
    Enter Username    ${USERNAME}
    Enter Password    ${WRONG_PASS}

When User Enters Invalid Username
    Enter Username    ${WRONG_USER}
    Enter Password    ${PASSWORD}

When User Clicks The Login Button
    Click Login Button

Then User Should Be Redirected To Secure Page
    User Should Be On Secure Page

Then Success Message Should Be Displayed
    Flash Message Should Contain    ${MSG_SUCCESS}

Then Error Message Bad Password Should Be Displayed
    Flash Message Should Contain    ${MSG_BAD_PASS}

Then Error Message Bad Username Should Be Displayed
    Flash Message Should Contain    ${MSG_BAD_USER}

Then User Should Remain On Login Page
    User Should Be On Login Page

When User Clicks The Logout Button
    Click Logout Button

Then Logout Message Should Be Displayed
    Flash Message Should Contain    ${MSG_LOGOUT}

Then User Should Be Redirected To Login Page
    User Should Be On Login Page