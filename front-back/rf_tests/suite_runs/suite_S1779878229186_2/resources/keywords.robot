*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Locked User
    Go To    ${BASE_URL}
    Fill Username    ${LOCKED_USER}
    Fill Password    ${PASSWORD}
    Click Login Button

Verify Locked User Error Is Displayed
    Error Message Is Visible
    ${msg}=    Get Error Message Text
    Should Contain    ${msg}    locked out

Login With Valid User
    Go To    ${BASE_URL}
    Fill Username    ${VALID_USER}
    Fill Password    ${PASSWORD}
    Click Login Button
    Wait Until Location Is    ${INVENTORY_URL}    timeout=10s

Sort Products By Price Low To High
    Select Sort Option    lohi

Verify Products Are Sorted By Price Ascending
    ${prices}=    Get All Product Prices
    ${sorted}=    Copy List    ${prices}
    Sort List    ${sorted}
    Lists Should Be Equal    ${prices}    ${sorted}

Logout Via Burger Menu
    Open Burger Menu
    Click Logout

Verify User Is Redirected To Login Page
    Wait Until Location Is    ${LOGIN_URL}/    timeout=10s
    Element Should Be Visible    ${LOGIN_BUTTON}