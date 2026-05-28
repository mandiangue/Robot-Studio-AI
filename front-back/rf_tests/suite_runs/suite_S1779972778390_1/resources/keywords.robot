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

Verify Locked User Cannot Access Catalog
    Verify Locked Error Message
    Verify Catalog Page Is Not Accessible

Login With Standard User
    Open Login Page
    Fill Username    ${STANDARD_USER}
    Fill Password    ${PASSWORD}
    Click Login Button
    Wait Until Element Is Visible    css=.inventory_list    timeout=10s

Add Product To Cart And Verify
    Add First Product To Cart
    Verify Cart Badge Is One
    Verify Remove Button Is Visible

Sort Products By Price Low To High And Verify
    Select Sort Option Low To High
    Verify Products Sorted By Price Low To High