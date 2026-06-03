*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Get Error Message Text
    [Return]    ${text}
    ${text}=    Get Text    ${ERROR_MESSAGE}

Verify Locked Out Error Message
    Element Should Be Visible    ${ERROR_MESSAGE}
    ${text}=    Get Text    ${ERROR_MESSAGE}
    Should Contain    ${text}    Sorry, this user has been locked out

Select Sort Option
    [Arguments]    ${option_value}
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Get All Product Prices As Numbers
    [Return]    @{prices}
    ${elements}=    Get WebElements    ${PRODUCT_PRICES}
    @{prices}=    Create List
    FOR    ${el}    IN    @{elements}
        ${raw}=    Get Text    ${el}
        ${clean}=    Remove String    ${raw}    $
        ${num}=    Convert To Number    ${clean}
        Append To List    ${prices}    ${num}
    END

Verify Prices Are Sorted Ascending
    ${elements}=    Get WebElements    ${PRODUCT_PRICES}
    @{prices}=    Create List
    FOR    ${el}    IN    @{elements}
        ${raw}=    Get Text    ${el}
        ${clean}=    Remove String    ${raw}    $
        ${num}=    Convert To Number    ${clean}
        Append To List    ${prices}    ${num}
    END
    ${sorted}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted}

Open Burger Menu
    Click Element    ${BURGER_MENU}

Click Logout
    Wait Until Element Is Visible    ${LOGOUT_LINK}    timeout=5s
    Click Element    ${LOGOUT_LINK}

Verify Redirected To Login Page
    Location Should Be    ${BASE_URL}/