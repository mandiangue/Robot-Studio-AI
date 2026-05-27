*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Locked User
    Open Login Page
    Fill Username    ${LOCKED_USER}
    Fill Password    ${PASSWORD}
    Click Login Button

Verify Locked User Error Is Displayed
    Error Message Is Visible
    ${msg}=    Get Error Message Text
    Should Contain    ${msg}    Sorry, this user has been locked out

Login With Valid User
    Open Login Page
    Fill Username    ${VALID_USER}
    Fill Password    ${PASSWORD}
    Click Login Button

Add First Product To Cart And Verify
    Add First Product To Cart
    ${count}=    Get Cart Badge Count
    Should Be Equal As Strings    ${count}    1
    First Product Button Shows Remove

Sort Products By Price Low To High
    Select Sort Option    lohi

Verify Products Are Sorted By Price Ascending
    Prices Are Sorted Ascending