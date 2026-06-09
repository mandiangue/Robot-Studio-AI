*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
    [Arguments]    ${url}    ${browser}=chrome
    Open Browser    ${url}    ${browser}    options=add_argument("--incognito");add_argument("--disable-notifications");add_argument("--disable-save-password-bubble");add_argument("--disable-infobars");add_argument("--disable-popup-blocking");add_argument("--disable-features=PasswordManagerEnabled,TranslateUI,AutofillServerCommunication,PasswordLeakDetection,SavePasswordsBubble");add_argument("--no-first-run");add_argument("--no-default-browser-check");add_argument("--password-store=basic");add_argument("--user-data-dir=C:/Users/Landing/AppData/Local/Temp/chrome_rf_1780767552864");add_experimental_option("prefs",{"credentials_enable_service":false,"profile.password_manager_enabled":false,"profile.password_manager_leak_detection":false,"profile.default_content_setting_values.notifications":2,"profile.default_content_settings.popups":0,"autofill.profile_enabled":false,"autofill.credit_card_enabled":false});add_experimental_option("excludeSwitches",["enable-automation","enable-logging"])

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



Given User Opens SauceDemo Website
    Go To    ${BASE_URL}

When User Logs In With Performance Glitch User
    Fill Login Form    ${USERNAME_GLITCH}    ${PASSWORD}

Then Inventory Page Should Be Displayed
    Verify Inventory Page Is Displayed

Given User Is Logged In As Standard User
    Go To    ${BASE_URL}
    Fill Login Form    ${USERNAME_STD}    ${PASSWORD}
    Verify Inventory Page Is Displayed

When User Selects Sort By Price High To Low
    Select Sort Option High To Low

Then Products Should Be Displayed From High To Low Price
    Verify Products Sorted High To Low

When User Adds Three Different Products To Cart
    Add Three Products To Cart

Then Cart Badge Should Display Three
    Verify Cart Badge Shows    3

Then Cart Should Contain Three Items
    Navigate To Cart Page
    ${items}=    Get WebElements    css=.cart_item
    Length Should Be    ${items}    3

When User Adds Two Products To Cart
    Add Two Products To Cart

When User Navigates To Cart Page
    Navigate To Cart Page

When User Removes One Product From Cart
    Remove First Product From Cart

Then Cart Badge Should Display One
    Verify Cart Badge Shows One

Then Cart Should Contain One Item
    Verify Cart Contains One Item

When User Adds One Product To Cart
    Add One Product To Cart

When User Proceeds To Checkout
    Navigate To Cart Page
    Start Checkout Process

When User Fills Checkout Form With Valid Information
    Fill Checkout Information    Jean    Dupont    75001

When User Finishes The Order
    Finish Order

Then Order Confirmation Message Should Be Displayed
    Verify Order Confirmation

When User Opens Hamburger Menu
    Open Hamburger Menu

When User Clicks Logout
    Click Logout

Then User Should Be Redirected To Login Page
    Verify Login Page Is Displayed