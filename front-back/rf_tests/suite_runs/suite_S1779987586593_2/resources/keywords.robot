*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Navigate To Base URL
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Login With Locked User
    Navigate To Base URL
    Fill Login Form    ${LOCKED_USER}    ${PASSWORD}

Verify Locked User Cannot Login
    Verify Locked Error Message Is Displayed

Login With Standard User
    Navigate To Base URL
    Fill Login Form    ${STANDARD_USER}    ${PASSWORD}
    Verify User Is On Inventory Page

Sort Products By Price Low To High
    Select Sort Option    lohi
    Verify Products Are Sorted By Price Low To High

Add Product To Cart And Go To Cart
    Add First Product To Cart
    Navigate To Cart Page

Remove Product From Cart And Verify Cart Is Empty
    Remove Product From Cart
    Verify Cart Is Empty