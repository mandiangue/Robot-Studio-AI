*** Settings ***
Suite Setup    Register Keyword To Run On Failure    Capture Page Screenshot
Documentation    Tests Main
Library    SeleniumLibrary
Resource    ../resources/variables.robot
Resource    ../resources/keywords.robot



*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    [Documentation]    Login with valid username and password
    Open Login Page
    Login With Credentials    ${VALID_USERNAME}    ${VALID_PASSWORD}
    Verify Successful Login

TC_002 Failed Login With Invalid Username
    [Documentation]    Login attempt with invalid username
    Open Login Page
    Login With Credentials    ${INVALID_USERNAME}    ${VALID_PASSWORD}
    Verify Invalid Username Error

TC_003 Failed Login With Invalid Password
    [Documentation]    Login attempt with invalid password
    Open Login Page
    Login With Credentials    ${VALID_USERNAME}    ${INVALID_PASSWORD}
    Verify Invalid Password Error

TC_004 Successful Logout After Login
    [Documentation]    Logout after a successful login
    Open Login Page
    Login With Credentials    ${VALID_USERNAME}    ${VALID_PASSWORD}
    Verify Successful Login
    Logout From Secure Area
    Verify Successful Logout