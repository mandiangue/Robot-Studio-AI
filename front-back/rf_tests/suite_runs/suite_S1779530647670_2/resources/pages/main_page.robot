*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Model for SauceDemo main pages
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Maximize Browser Window
    Wait Until Page Contains Element    ${USERNAME_FIELD}    timeout=10s

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Inventory Page Displayed
    Wait Until Page Contains Element    ${INVENTORY_CONTAINER}    timeout=10s
    Page Should Contain    Products

Verify Error Message Displayed
    Wait Until Page Contains Element    ${ERROR_MESSAGE}    timeout=10s
    Element Should Be Visible    ${ERROR_MESSAGE}

Get Error Message Text
    ${error_text}=    Get Text    ${ERROR_MESSAGE}
    [Return]    ${error_text}

Click Add To Cart Button
    [Arguments]    ${index}=1
    ${buttons}=    Get WebElements    ${ADD_TO_CART_BUTTON}
    Click Element    @{buttons}[${index - 1}]

Get Cart Badge Count
    ${count}=    Get Text    ${CART_BADGE}
    [Return]    ${count}

Verify Cart Badge Shows Count
    [Arguments]    ${expected_count}
    Wait Until Page Contains Element    ${CART_BADGE}    timeout=5s
    ${actual_count}=    Get Text    ${CART_BADGE}
    Should Be Equal As Strings    ${actual_count}    ${expected_count}

Click Cart Icon
    Click Element    ${CART_ICON}
    Wait Until Page Contains Element    ${CHECKOUT_BUTTON}    timeout=5s

Click Checkout Button
    Click Button    ${CHECKOUT_BUTTON}
    Wait Until Page Contains Element    ${FIRSTNAME_FIELD}    timeout=5s

Enter Checkout Information
    [Arguments]    ${firstname}    ${lastname}    ${postal_code}
    Input Text    ${FIRSTNAME_FIELD}    ${firstname}
    Input Text    ${LASTNAME_FIELD}    ${lastname}
    Input Text    ${POSTAL_CODE_FIELD}    ${postal_code}

Click Continue Button
    Click Button    ${CONTINUE_BUTTON}
    Wait Until Page Contains Element    ${FINISH_BUTTON}    timeout=5s

Click Finish Button
    Click Button    ${FINISH_BUTTON}

Verify Order Confirmation Displayed
    Wait Until Page Contains Element    ${CONFIRMATION_MESSAGE}    timeout=10s
    Page Should Contain    Thank you for your order
    Element Should Be Visible    ${CONFIRMATION_MESSAGE}

Get Order Confirmation Text
    ${confirmation_text}=    Get Text    ${CONFIRMATION_MESSAGE}
    [Return]    ${confirmation_text}

Click Back Home Button
    Click Button    ${BACK_HOME_BUTTON}
    Wait Until Page Contains Element    ${INVENTORY_CONTAINER}    timeout=5s

Close Browser Session