*** Settings ***
Suite Setup       Go To    ${BTN_LOGIN}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for SauceDemo — covers Login, Products and Menu interactions
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Browser To Login Page

    Maximize Browser Window
    Set Selenium Timeout    ${TIMEOUT}
    Wait Until Element Is Visible    ${INPUT_USERNAME}

Fill Login Form
    [Arguments]    ${username}    ${password}
    Input Text    ${INPUT_USERNAME}    ${username}
    Input Password    ${INPUT_PASSWORD}    ${password}

Submit Login Form
    Click Button    ${BTN_LOGIN}

Verify Products Page Is Displayed
    Wait Until Element Is Visible    css=.inventory_list
    Location Should Contain    inventory

Click Add To Cart Button
    Wait Until Element Is Visible    ${BTN_ADD_TO_CART}
    Click Button    ${BTN_ADD_TO_CART}

Verify Cart Badge Shows
    [Arguments]    ${expected_count}
    Wait Until Element Is Visible    ${CART_BADGE}
    Element Text Should Be    ${CART_BADGE}    ${expected_count}

Verify Remove Button Is Displayed
    Wait Until Element Is Visible    ${BTN_REMOVE}
    Element Should Be Visible    ${BTN_REMOVE}

Select Sort Option By Price Low To High
    Wait Until Element Is Visible    ${SORT_DROPDOWN}
    Select From List By Label    ${SORT_DROPDOWN}    ${SORT_OPTION_LOW_HIGH}

Verify Products Are Sorted By Price Ascending
    Wait Until Element Is Visible    ${PRODUCT_PRICES}
    ${prices}=    Get WebElements    ${PRODUCT_PRICES}
    ${values}=    Create List
    FOR    ${price_element}    IN    @{prices}
        ${text}=    Get Text    ${price_element}
        ${number}=    Evaluate    float("${text}".replace("$","").strip())
        Append To List    ${values}    ${number}
    END
    ${sorted_values}=    Evaluate    sorted(${values})
    Lists Should Be Equal    ${values}    ${sorted_values}

Open Burger Menu
    Wait Until Element Is Visible    ${BTN_BURGER_MENU}
    Click Button    ${BTN_BURGER_MENU}
    Wait Until Element Is Visible    ${LINK_LOGOUT}

Click Logout Link
    Click Element    ${LINK_LOGOUT}

Verify Login Page Is Displayed
    Wait Until Element Is Visible    ${LOGIN_CONTAINER}
    Element Should Be Visible    ${INPUT_USERNAME}
    Element Should Be Visible    ${INPUT_PASSWORD}
    Location Should Be    ${BASE_URL}/