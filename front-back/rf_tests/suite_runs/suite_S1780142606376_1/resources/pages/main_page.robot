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

Fill Login Form
    [Arguments]    ${username}    ${password}
    Input Text    ${USERNAME_FIELD}    ${username}
    Input Text    ${PASSWORD_FIELD}    ${password}

Submit Login Form
    Click Button    ${LOGIN_BUTTON}

Verify Locked User Error
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    ${text}=    Get Text    ${ERROR_MESSAGE}
    Should Be Equal As Strings    ${text}    ${LOCKED_ERROR_TEXT}

Navigate To Backpack Detail Page
    Wait Until Element Is Visible    ${BACKPACK_LINK}    timeout=10s
    Click Element    ${BACKPACK_LINK}

Click Add To Cart On Product Page
    Wait Until Element Is Visible    ${ADD_TO_CART_BTN}    timeout=10s
    Click Button    ${ADD_TO_CART_BTN}

Verify Cart Badge Is One
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s
    ${badge_text}=    Get Text    ${CART_BADGE}
    Should Be Equal As Strings    ${badge_text}    1

Verify Remove Button Is Visible
    Element Should Be Visible    ${REMOVE_BTN}

Select Sort Option Low To High
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    lohi

Verify Products Sorted By Price Ascending
    ${prices}=    Get WebElements    ${PRODUCT_PRICES}
    ${prev}=    Set Variable    ${0}
    FOR    ${price_el}    IN    @{prices}
        ${raw}=    Get Text    ${price_el}
        ${clean}=    Evaluate    float("${raw}".replace("$",""))
        Should Be True    ${clean} >= ${prev}
        ${prev}=    Set Variable    ${clean}
    END