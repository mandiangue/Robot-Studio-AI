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

Login With Valid Credentials
    Login With Credentials    ${VALID_USERNAME}    ${VALID_PASSWORD}

Logout From Secure Area
    Click Logout Button

Verify Success Login Message
    Verify Flash Message Contains    ${SUCCESS_LOGIN_MESSAGE}

Verify Invalid Username Message
    Verify Flash Message Contains    ${INVALID_USERNAME_MESSAGE}

Verify Invalid Password Message
    Verify Flash Message Contains    ${INVALID_PASSWORD_MESSAGE}

Verify Logout Message
    Verify Flash Message Contains    ${LOGOUT_MESSAGE}