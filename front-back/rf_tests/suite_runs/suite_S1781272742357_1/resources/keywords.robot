*** Settings ***
Library      Browser
Library      Collections
Resource     variables.robot
Resource     pages/main_page.robot

*** Keywords ***
Open Browser Session
    [Arguments]    ${url}=${BASE_URL}    ${browser}=${BROWSER}
    New Browser    ${browser}    headless=${HEADLESS}
    New Context    acceptDownloads=True
    New Page       ${url}

Login With User
    [Arguments]    ${username}    ${password}
    Enter Username    ${username}
    Enter Password    ${password}
    Click Login Button

Verify Login Error Message
    [Arguments]    ${expected_message}
    ${actual}=    Get Error Message Text
    Should Contain    ${actual}    ${expected_message}

Sort Products By
    [Arguments]    ${option}
    Select Sort Option    ${option}

Verify Products Sorted By Price Descending
    ${prices}=    Get All Product Prices
    ${sorted}=    Copy List    ${prices}
    Sort List    ${sorted}
    Reverse List    ${sorted}
    Lists Should Be Equal    ${prices}    ${sorted}

Add Three Products To Cart
    Click Add To Cart Button    sauce-labs-backpack
    Click Add To Cart Button    sauce-labs-bike-light
    Click Add To Cart Button    sauce-labs-bolt-t-shirt

Verify Cart Badge Count
    [Arguments]    ${expected_count}
    ${count}=    Get Cart Badge Count
    Should Be Equal As Strings    ${count}    ${expected_count}

Open Cart Page
    Click Cart Icon

Verify Cart Contains Items
    [Arguments]    ${expected_count}
    ${count}=    Get Cart Items Count
    Should Be Equal As Integers    ${count}    ${expected_count}

Add Single Product To Cart
    [Arguments]    ${product_id}=sauce-labs-backpack
    Click Add To Cart Button    ${product_id}

Remove Product From Cart Page
    [Arguments]    ${product_id}=sauce-labs-backpack
    Click Remove Button In Cart    ${product_id}

Verify Cart Is Empty
    ${count}=    Get Cart Items Count
    Should Be Equal As Integers    ${count}    0

Start Checkout Process
    Click Checkout Button

Fill Checkout Information
    [Arguments]    ${firstname}    ${lastname}    ${postal}
    Enter First Name    ${firstname}
    Enter Last Name    ${lastname}
    Enter Postal Code    ${postal}

Continue Checkout
    Click Continue Button

Finish Checkout
    Click Finish Button

Verify Checkout Error Message
    [Arguments]    ${expected_message}
    ${actual}=    Get Checkout Error Text
    Should Contain    ${actual}    ${expected_message}

Verify Order Confirmation
    [Arguments]    ${expected_message}
    ${actual}=    Get Order Confirmation Text
    Should Contain    ${actual}    ${expected_message}

Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    Evaluate    __import__("sys").path.insert(0, r"${EXECDIR}") or __import__("sys").path.insert(0, r"${EXECDIR}${/}..")    sys
    ${driver_path}=    Evaluate    __import__("NoPopupOptions").get_driver_path("${browser}")
    ${opts}=    Evaluate    __import__("NoPopupOptions").get_no_popup_options("${browser}")
    ${is_chrome}=    Evaluate    "${browser}".lower() in ("chrome", "chromium")
    Run Keyword If    ${is_chrome}    Open Browser    ${url}    ${browser}    executable_path=${driver_path}    options=${opts}
    Run Keyword Unless    ${is_chrome}    Open Browser    ${url}    ${browser}    executable_path=${driver_path}

