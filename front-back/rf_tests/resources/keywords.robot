*** Settings ***
Resource    pages/login_page.robot
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    Open Browser    ${url}    ${browser}    options=add_argument("--incognito");add_argument("--disable-notifications");add_argument("--disable-save-password-bubble");add_argument("--disable-infobars");add_argument("--disable-popup-blocking");add_argument("--disable-features=PasswordManagerEnabled,TranslateUI,AutofillServerCommunication,PasswordLeakDetection,SavePasswordsBubble");add_argument("--no-first-run");add_argument("--no-default-browser-check");add_argument("--password-store=basic");add_argument("--user-data-dir=C:/Users/Landing/AppData/Local/Temp/chrome_rf_1780500839675");add_experimental_option("prefs",{"credentials_enable_service":false,"profile.password_manager_enabled":false,"profile.password_manager_leak_detection":false,"profile.default_content_setting_values.notifications":2,"profile.default_content_settings.popups":0,"autofill.profile_enabled":false,"autofill.credit_card_enabled":false});add_experimental_option("excludeSwitches",["enable-automation","enable-logging"])

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
    Go To    ${BASE_URL}

When User Enters Valid Credentials
    Enter Username    ${USERNAME}
    Enter Password    ${PASSWORD}

When User Enters Invalid Password
    Enter Username    ${USERNAME}
    Enter Password    ${WRONG_PASSWORD}

When User Enters Invalid Username
    Enter Username    ${WRONG_USERNAME}
    Enter Password    ${PASSWORD}

When User Clicks The Login Button
    Click Login Button

Then User Should See Success Message
    ${text}=    Get Flash Message Text
    Should Contain    ${text}    ${SUCCESS_MSG}

Then User Should See Invalid Password Error
    ${text}=    Get Flash Message Text
    Should Contain    ${text}    ${WRONG_PASS_MSG}
    ${color}=    Get Flash Message Color
    Should Be Equal As Strings    ${color}    ${FLASH_ERROR_COLOR}

Then User Should See Invalid Username Error
    ${text}=    Get Flash Message Text
    Should Contain    ${text}    ${WRONG_USER_MSG}
    ${color}=    Get Flash Message Color
    Should Be Equal As Strings    ${color}    ${FLASH_ERROR_COLOR}

Then User Should Remain On Login Page
    Verify Still On Login Page

When User Clicks The Logout Button
    Click Logout Button

Then User Should See Logout Confirmation Message
    ${text}=    Get Flash Message Text
    Should Contain    ${text}    ${LOGOUT_MSG}

Then User Should Be Redirected To Login Page
    Location Should Contain    /login
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s
Given Open Login Page
    Open Login Page

When Enter Valid Credentials
    Enter Username    ${VALID_USER}
    Enter Password    ${VALID_PASS}

When Enter Invalid Username Credentials
    Enter Username    ${WRONG_USER}
    Enter Password    ${VALID_PASS}

When Enter Invalid Password Credentials
    Enter Username    ${VALID_USER}
    Enter Password    ${WRONG_PASS}

When Click On Login Button
    Click Login Button

Then User Should Be Redirected To Secure Page
    Verify Successful Login

Then Invalid Username Error Should Be Displayed
    Verify Invalid Username Error

Then Invalid Password Error Should Be Displayed
    Verify Invalid Password Error

When Click On Logout Button
    Click Logout Button

Then User Should Be Redirected To Login Page After Logout
    Verify Successful Logout