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

Navigate To Login Page
    Go To    ${LOGIN_URL}

Enter Username
    [Arguments]    ${username}
    Input Text    id=username    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    id=password    ${password}

Click Login Button
    Click Button    css=button[type="submit"]

Verify Successful Login
    Wait Until Page Contains    You logged into a secure area!    timeout=10s
    Location Should Contain    /secure
    Page Should Contain Element    css=a.button.secondary.radius

Verify Invalid Username Error
    Wait Until Page Contains    Your username is invalid!    timeout=10s
    Location Should Contain    /login

Verify Invalid Password Error
    Wait Until Page Contains    Your password is invalid!    timeout=10s
    Location Should Contain    /login

Click Logout Button
    Click Element    css=a.button.secondary.radius

Verify Successful Logout
    Wait Until Page Contains    You logged out of the secure area!    timeout=10s
    Location Should Contain    /login