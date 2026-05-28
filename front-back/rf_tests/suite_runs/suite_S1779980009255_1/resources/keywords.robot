*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Verify Locked User Error Message
    Error Message Should Contain    Epic sadface: Sorry, this user has been locked out

Verify Products Sorted By Price Ascending
    ${price_elements}=    Get All Product Prices
    ${count}=    Get Length    ${price_elements}
    Should Be True    ${count} > 0
    ${first_price_text}=    Get Text    ${price_elements}[0]
    ${last_price_text}=    Get Text    ${price_elements}[-1]
    ${first_price}=    Evaluate    float("${first_price_text}".replace("$",""))
    ${last_price}=    Evaluate    float("${last_price_text}".replace("$",""))
    Should Be True    ${first_price} <= ${last_price}

Login As Locked User
    Login With Credentials    ${LOCKED_USER}    ${PASSWORD}

Login As Valid User
    Login With Credentials    ${VALID_USER}    ${PASSWORD}

Sort Products By Price Low To High
    Select Sort Option    lohi

Add Product To Cart And Go To Cart
    Add First Product To Cart
    Go To Cart

Remove Product And Verify Cart Empty
    Remove Product From Cart
    Cart Should Be Empty
    Cart Badge Should Not Be Visible