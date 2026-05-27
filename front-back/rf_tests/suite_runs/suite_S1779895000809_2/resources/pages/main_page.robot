*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for Saucedemo pages
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${LOGIN_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Fill Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Fill Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Login With Credentials
    [Arguments]    ${username}    ${password}
    Fill Username    ${username}
    Fill Password    ${password}
    Click Login Button

Get Error Message Text
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    ${text}=    Get Text    ${ERROR_MESSAGE}
    [Return]    ${text}

Select Sort Option
    [Arguments]    ${option_value}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Get All Product Prices
    Wait Until Element Is Visible    ${PRODUCT_PRICES}    timeout=10s
    ${elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${prices}=    Create List
    FOR    ${el}    IN    @{elements}
        ${raw}=    Get Text    ${el}
        ${price}=    Evaluate    float('${raw}'.replace('$','').strip())
        Append To List    ${prices}    ${price}
    END
    [Return]    ${prices}

Open Burger Menu
    Wait Until Element Is Visible    ${BURGER_MENU}    timeout=10s
    Click Element    ${BURGER_MENU}

Click Logout
    Wait Until Element Is Visible    ${LOGOUT_LINK}    timeout=10s
    Click Element    ${LOGOUT_LINK}

Verify Redirected To Login Page
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s
    ${current_url}=    Get Location
    Should Be Equal As Strings    ${current_url}    ${LOGIN_URL}/