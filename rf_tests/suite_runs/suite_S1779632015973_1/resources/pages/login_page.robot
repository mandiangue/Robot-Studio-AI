*** Settings ***
Suite Setup       Go To    ${BTN_LOGIN}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for the Login Page
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    [Documentation]    Open the browser and navigate to the login URL

    Maximize Browser Window
    Wait Until Element Is Visible    ${INPUT_USERNAME}    timeout=10s

Enter Username
    [Documentation]    Type the given username into the username field
    [Arguments]    ${username}
    Clear Element Text    ${INPUT_USERNAME}
    Input Text    ${INPUT_USERNAME}    ${username}

Enter Password
    [Documentation]    Type the given password into the password field
    [Arguments]    ${password}
    Clear Element Text    ${INPUT_PASSWORD}
    Input Text    ${INPUT_PASSWORD}    ${password}

Click Login Button
    [Documentation]    Click the login submit button
    Click Button    ${BTN_LOGIN}

Flash Message Should Contain
    [Documentation]    Assert that the flash message contains the expected text
    [Arguments]    ${expected_text}
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain    ${FLASH_MESSAGE}    ${expected_text}

User Should Be On Secure Page
    [Documentation]    Assert the browser is redirected to the secure area URL
    Location Should Be    ${SECURE_URL}

User Should Stay On Login Page
    [Documentation]    Assert the browser remains on the login page URL
    Location Should Be    ${BASE_URL}

Click Logout Button
    [Documentation]    Click the logout button on the secure page
    Wait Until Element Is Visible    ${BTN_LOGOUT}    timeout=10s
    Click Link    ${BTN_LOGOUT}

Close Login Page
    [Documentation]    Close the browser after the test