*** Settings ***
Library    RequestsLibrary
Library    Collections

*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com
${LOGIN_ENDPOINT}    /login
${USERNAME_VALID}    tomsmith
${PASSWORD_VALID}    SuperSecretPassword!
${PASSWORD_INVALID}    WrongPassword123
${USERNAME_INVALID}    invaliduser

*** Keywords ***
Create Login Session
    Create Session    login_session    ${BASE_URL}

Delete Login Session
    Delete All Sessions

Submit Login Request
    [Arguments]    ${username}    ${password}
    ${data}=    Create Dictionary    username=${username}    password=${password}
    ${response}=    POST On Session    login_session    ${LOGIN_ENDPOINT}    data=${data}
    [Return]    ${response}

Validate Success Login Response
    [Arguments]    ${response}
    Should Be Equal As Strings    ${response.status_code}    200
    Should Contain    ${response.text}    You logged into a secure area!
    Should Contain    ${response.text}    Logout

Validate Invalid Password Response
    [Arguments]    ${response}
    Should Be Equal As Strings    ${response.status_code}    200
    Should Contain    ${response.text}    Your password is invalid!

Validate Invalid Username Response
    [Arguments]    ${response}
    Should Be Equal As Strings    ${response.status_code}    200
    Should Contain    ${response.text}    Your username is invalid!

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    Given Create Login Session
    When Submit Login Request    ${USERNAME_VALID}    ${PASSWORD_VALID}
    ${response}=    Submit Login Request    ${USERNAME_VALID}    ${PASSWORD_VALID}
    Then Validate Success Login Response    ${response}
    [Teardown]    Delete Login Session

TC_002 Failed Login With Incorrect Password
    Given Create Login Session
    When Submit Login Request    ${USERNAME_VALID}    ${PASSWORD_INVALID}
    ${response}=    Submit Login Request    ${USERNAME_VALID}    ${PASSWORD_INVALID}
    Then Validate Invalid Password Response    ${response}
    [Teardown]    Delete Login Session

TC_003 Failed Login With Incorrect Username
    Given Create Login Session
    When Submit Login Request    ${USERNAME_INVALID}    ${PASSWORD_VALID}
    ${response}=    Submit Login Request    ${USERNAME_INVALID}    ${PASSWORD_VALID}
    Then Validate Invalid Username Response    ${response}
    [Teardown]    Delete Login Session