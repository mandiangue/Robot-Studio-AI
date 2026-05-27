*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main - SauceDemo
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Fill Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Fill Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Locked User Error Message
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    ${msg}=    Get Text    ${ERROR_MESSAGE}
    Should Contain    ${msg}    locked out

Verify Products Page Is Displayed
    Location Should Contain    inventory.html

Select Sort Option Low To High
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    ${SORT_LOHI}

Verify Products Are Sorted By Price Ascending
    Wait Until Element Is Visible    ${PRODUCT_PRICES}    timeout=10s
    ${elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${prices}=    Create List
    FOR    ${el}    IN    @{elements}
        ${text}=    Get Text    ${el}
        ${clean}=    Remove String    ${text}    $
        ${price}=    Convert To Number    ${clean}
        Append To List    ${prices}    ${price}
    END
    ${sorted}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted}

Open Burger Menu
    Wait Until Element Is Visible    ${BURGER_MENU}    timeout=10s
    Click Element    ${BURGER_MENU}

Click Logout
    Wait Until Element Is Visible    ${LOGOUT_LINK}    timeout=10s
    Click Element    ${LOGOUT_LINK}

Verify User Is On Login Page
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s
    Location Should Be    ${BASE_URL}/