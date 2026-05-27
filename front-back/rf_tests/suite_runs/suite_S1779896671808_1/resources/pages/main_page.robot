*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for SauceDemo pages
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${LOGIN_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Wait For Products Page
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s

Select Sort Price Low To High
    Select From List By Value    ${SORT_DROPDOWN}    lohi

Get All Product Prices
    ${price_elements}=    Get WebElements    ${ALL_PRICES}
    ${prices}=    Create List
    FOR    ${element}    IN    @{price_elements}
        ${text}=    Get Text    ${element}
        ${value}=    Evaluate    float('${text}'.replace('$','').strip())
        Append To List    ${prices}    ${value}
    END
    [Return]    ${prices}

Add First Product To Cart
    Click Button    ${ADD_TO_CART_BUTTON}
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s

Go To Cart Page
    Click Element    ${CART_ICON}
    Wait Until Element Is Visible    ${CART_ITEM}    timeout=10s

Click Remove Button
    Click Button    ${REMOVE_BUTTON}

Verify Cart Is Empty
    Wait Until Element Is Not Visible    ${CART_BADGE}    timeout=10s
    Page Should Not Contain Element    ${CART_ITEM}

Click Checkout Button
    Click Element    ${CHECKOUT_BUTTON}
    Wait Until Element Is Visible    ${FIRST_NAME_FIELD}    timeout=10s

Enter First Name
    [Arguments]    ${first_name}
    Input Text    ${FIRST_NAME_FIELD}    ${first_name}

Enter Last Name
    [Arguments]    ${last_name}
    Input Text    ${LAST_NAME_FIELD}    ${last_name}

Enter Postal Code
    [Arguments]    ${postal_code}
    Input Text    ${POSTAL_CODE_FIELD}    ${postal_code}

Click Continue Button
    Click Element    ${CONTINUE_BUTTON}
    Wait Until Element Is Visible    ${FINISH_BUTTON}    timeout=10s

Click Finish Button
    Click Element    ${FINISH_BUTTON}
    Wait Until Element Is Visible    ${CONFIRMATION_MSG}    timeout=10s

Verify Order Confirmation
    ${text}=    Get Text    ${CONFIRMATION_MSG}
    Should Be Equal As Strings    ${text}    ${CONFIRMATION_TEXT}