*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Log In With Valid Credentials
    Open Login Page
    Fill Username    ${VALID_USER}
    Fill Password    ${VALID_PASSWORD}
    Click Login Button
    Verify Inventory Page Is Displayed

Sort Products By Price Low To High
    Select Sort Option By Price Low To High

Verify Products Are Sorted By Price Ascending
    Verify Prices Are Sorted Ascending

Add Product To Cart And Verify Badge
    Add First Product To Cart
    Verify Cart Badge Count    1

Go To Cart Page
    Navigate To Cart

Remove Product From Cart
    Remove Item From Cart

Verify Cart Is Now Empty
    Verify Cart Is Empty

Open Side Menu And Logout
    Open Burger Menu
    Click Logout

Verify User Is Redirected To Login Page
    Verify Login Page Is Displayed

Verify Login Fields Are Empty
    Verify Username Field Is Empty
    Verify Password Field Is Empty