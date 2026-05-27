*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Valid User
    Open Login Page
    Enter Username    ${USERNAME}
    Enter Password    ${PASSWORD}
    Click Login Button
    Wait For Products Page

Sort Products By Price Low To High
    Select Sort Price Low To High
    ${prices}=    Get All Product Prices
    ${sorted_prices}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted_prices}

Add Product To Cart And Go To Cart
    Add First Product To Cart
    Go To Cart Page

Remove Item From Cart
    Click Remove Button

Verify Cart Is Empty After Removal
    Verify Cart Is Empty

Proceed To Checkout And Fill Information
    [Arguments]    ${first_name}    ${last_name}    ${postal_code}
    Click Checkout Button
    Enter First Name    ${first_name}
    Enter Last Name    ${last_name}
    Enter Postal Code    ${postal_code}
    Click Continue Button

Confirm Order And Verify Success
    Click Finish Button
    Verify Order Confirmation