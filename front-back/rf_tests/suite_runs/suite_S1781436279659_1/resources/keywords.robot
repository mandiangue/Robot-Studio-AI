*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    Evaluate    __import__("sys").path.insert(0, r"${EXECDIR}") or __import__("sys").path.insert(0, r"${EXECDIR}${/}..")    sys
    ${driver_path}=    Evaluate    __import__("NoPopupOptions").get_driver_path("${browser}")
    ${opts}=    Evaluate    __import__("NoPopupOptions").get_no_popup_options("${browser}")
    ${is_chrome}=    Evaluate    "${browser}".lower() in ("chrome", "chromium")
    Run Keyword If    ${is_chrome}    Open Browser    ${url}    ${browser}    executable_path=${driver_path}    options=${opts}
    Run Keyword Unless    ${is_chrome}    Open Browser    ${url}    ${browser}    executable_path=${driver_path}

Open Login Page
    Go To    ${BASE_URL}

Login With Credentials
    [Arguments]    ${username}    ${password}
    Enter Username    ${username}
    Enter Password    ${password}
    Click Login Button

Verify Successful Login
    Verify Current Url Contains    /secure
    Verify Flash Message Contains    You logged into a secure area!

Verify Invalid Username Error
    Verify Current Url Contains    /login
    Verify Flash Message Contains    Your username is invalid!

Verify Invalid Password Error
    Verify Current Url Contains    /login
    Verify Flash Message Contains    Your password is invalid!

Logout From Secure Area
    Click Logout Button

Verify Successful Logout
    Verify Current Url Contains    /login
    Verify Flash Message Contains    You logged out of the secure area!