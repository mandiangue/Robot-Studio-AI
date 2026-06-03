*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main - SauceDemo
Library          SeleniumLibrary
Resource         ../variables.robot

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
    Element Should Contain    ${ERROR_MESSAGE}    Sorry, this user has been locked out

Verify Products Page Is Displayed
    Wait Until Element Is Visible    css=.inventory_list    timeout=10s

Select Sort Option By Price Low To High
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    lohi

Verify Products Are Sorted By Price Ascending
    ${prices}=    Get WebElements    ${PRODUCT_PRICES}
    ${price_values}=    Create List
    FOR    ${price}    IN    @{prices}
        ${text}=    Get Text    ${price}
        ${value}=    Evaluate    float('${text}'.replace('$',''))
        Append To List    ${price_values}    ${value}
    END
    ${sorted_prices}=    Evaluate    sorted(${price_values})
    Lists Should Be Equal    ${price_values}    ${sorted_prices}

Open Burger Menu
    Wait Until Element Is Visible    ${BURGER_MENU}    timeout=10s
    Click Element    ${BURGER_MENU}

Click Logout Link
    Wait Until Element Is Visible    ${LOGOUT_LINK}    timeout=10s
    Click Element    ${LOGOUT_LINK}

Verify Login Page Is Displayed
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s
    Location Should Be    ${BASE_URL}/