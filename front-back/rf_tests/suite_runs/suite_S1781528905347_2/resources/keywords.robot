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

Given Open Login Page
    Go To    ${BASE_URL}

When User Enters Username
    [Arguments]    ${username}
    Enter Username    ${username}

And User Enters Password
    [Arguments]    ${password}
    Enter Password    ${password}

When User Clicks Login Button
    Click Login Button

When User Clicks Logout Button
    Click Logout Button

Then User Should Be Redirected To Secure Area
    Verify Current Url Contains    /secure

Then User Should See Success Message
    Verify Flash Message Contains    ${MSG_LOGIN_SUCCESS}

Then User Should See Invalid Username Message
    Verify Flash Message Contains    ${MSG_INVALID_USERNAME}

Then User Should See Invalid Password Message
    Verify Flash Message Contains    ${MSG_INVALID_PASSWORD}

Then User Should Remain On Login Page
    Verify Current Url Contains    /login

Then User Should Be Redirected To Login Page
    Verify Current Url Contains    /login

Then User Should See Logout Message
    Verify Flash Message Contains    ${MSG_LOGOUT_SUCCESS}