*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for SauceDemo — Login and Inventory pages
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Browser To Login Page

    Maximize Browser Window
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Inventory Page Is Displayed
    Wait Until Location Contains    ${INVENTORY_URL}    timeout=10s
    Element Should Be Visible       ${INVENTORY_LIST}

Verify Cart Badge Shows
    [Arguments]    ${expected_count}
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s
    Element Text Should Be           ${CART_BADGE}    ${expected_count}

Verify First Product Button Text
    [Arguments]    ${expected_text}
    Element Text Should Be    ${FIRST_REMOVE_BUTTON}    ${expected_text}

Click Add To Cart For First Product
    Wait Until Element Is Visible    ${FIRST_ADD_TO_CART}    timeout=10s
    Click Button                     ${FIRST_ADD_TO_CART}

Verify Error Message Is Displayed
    [Arguments]    ${expected_text}
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Text Should Be           ${ERROR_MESSAGE}    ${expected_text}

Verify User Stays On Login Page
    Location Should Be    ${BASE_URL}/
    Element Should Be Visible    ${LOGIN_BUTTON}

Close Test Browser