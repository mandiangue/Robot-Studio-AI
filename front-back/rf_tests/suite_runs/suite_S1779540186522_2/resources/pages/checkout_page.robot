*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Checkout Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Checkout Page Should Be Displayed
    Wait Until Page Contains Element    ${FIRST_NAME_INPUT}    timeout=10s

Enter First Name
    [Arguments]    ${first_name}
    Input Text    ${FIRST_NAME_INPUT}    ${first_name}

Enter Last Name
    [Arguments]    ${last_name}
    Input Text    ${LAST_NAME_INPUT}    ${last_name}

Enter Postal Code
    [Arguments]    ${postal_code}
    Input Text    ${POSTAL_CODE_INPUT}    ${postal_code}

Click Continue Button
    Click Button    ${CONTINUE_BUTTON}

Click Finish Button
    Click Button    ${FINISH_BUTTON}

Confirmation Page Should Be Displayed
    Wait Until Page Contains Element    ${CONFIRMATION_MESSAGE}    timeout=10s
    Page Should Contain    Thank you for your order