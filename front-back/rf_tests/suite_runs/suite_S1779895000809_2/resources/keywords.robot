*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Navigate To Login Page
    Open Login Page

Attempt Login With Locked User
    Login With Credentials    ${LOCKED_USER}    ${PASSWORD}

Verify Locked User Error Message
    ${msg}=    Get Error Message Text
    Should Contain    ${msg}    Sorry, this user has been locked out

Login With Valid User
    Open Login Page
    Login With Credentials    ${VALID_USER}    ${PASSWORD}
    Wait Until Location Contains    inventory    timeout=10s

Apply Sort Price Low To High
    Select Sort Option    lohi

Verify Products Sorted By Price Ascending
    ${prices}=    Get All Product Prices
    ${sorted}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted}

Open Navigation Menu
    Open Burger Menu

Perform Logout
    Click Logout

Verify User Is Logged Out
    Verify Redirected To Login Page