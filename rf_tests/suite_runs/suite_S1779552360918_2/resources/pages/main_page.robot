*** Settings ***
Suite Setup       Open Browser No Popup    ${BTN_LOGIN}    chrome
Suite Teardown    Close Browser
Documentation    Page Object — SauceDemo Login & Inventory
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Browser To Login Page

    Maximize Browser Window
    Wait Until Element Is Visible    ${INPUT_USERNAME}    timeout=10s

Fill Username
    [Arguments]    ${username}
    Clear Element Text    ${INPUT_USERNAME}
    Input Text    ${INPUT_USERNAME}    ${username}

Fill Password
    [Arguments]    ${password}
    Clear Element Text    ${INPUT_PASSWORD}
    Input Text    ${INPUT_PASSWORD}    ${password}

Click Login Button
    Click Button    ${BTN_LOGIN}

Verify Inventory Page Is Displayed
    Wait Until Location Contains    ${INVENTORY_URL_PART}    timeout=10s
    Wait Until Element Is Visible    ${INVENTORY_LIST}    timeout=10s

Click Add To Cart For First Product
    Wait Until Element Is Visible    ${FIRST_ADD_TO_CART_BTN}    timeout=10s
    Click Button    ${FIRST_ADD_TO_CART_BTN}

Verify Cart Badge Shows One
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s
    Element Text Should Be    ${CART_BADGE}    1

Verify First Product Button Is Remove
    Wait Until Element Is Visible    ${FIRST_REMOVE_BTN}    timeout=10s
    ${button_text}=    Get Text    ${FIRST_REMOVE_BTN}
    Should Contain    ${button_text}    Remove

Verify Error Message Is Displayed
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Text Should Be    ${ERROR_MESSAGE}    ${EXPECTED_ERROR_TEXT}

Verify User Is Still On Login Page
    Location Should Be    ${BASE_URL}/

Close Test Browser