*** Settings ***
Suite Setup       Go To    ${LOGIN_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main - SauceDemo
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Navigate To Login Page
    Go To    ${LOGIN_URL}

Fill Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Fill Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Get Error Message Text
    ${text}=    Get Text    ${ERROR_MESSAGE}
    [Return]    ${text}

Error Message Is Visible
    Element Should Be Visible    ${ERROR_MESSAGE}

Current URL Should Be Login Page
    Location Should Be    ${LOGIN_URL}/

Select Sort Option
    [Arguments]    ${option_value}
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Get All Product Prices
    ${elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${prices}=    Create List
    FOR    ${el}    IN    @{elements}
        ${text}=    Get Text    ${el}
        ${text}=    Remove String    ${text}    $
        Append To List    ${prices}    ${text}
    END
    [Return]    ${prices}

Open Burger Menu
    Click Element    ${BURGER_MENU}

Click Logout
    Wait Until Element Is Visible    ${LOGOUT_LINK}    timeout=5s
    Click Element    ${LOGOUT_LINK}