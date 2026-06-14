*** Settings ***
Suite Setup    Register Keyword To Run On Failure    Capture Page Screenshot
Documentation    Tests Main
Library    SeleniumLibrary
Resource    ../resources/variables.robot
Resource    ../resources/keywords.robot



*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    Open Login Page
    Login With Credentials    ${VALID_USERNAME}    ${VALID_PASSWORD}
    Verify Success Login Message

TC_002 Failed Login With Invalid Username
    Open Login Page
    Login With Credentials    ${INVALID_USERNAME}    ${VALID_PASSWORD}
    Verify Invalid Username Message

TC_003 Failed Login With Invalid Password
    Open Login Page
    Login With Credentials    ${VALID_USERNAME}    ${INVALID_PASSWORD}
    Verify Invalid Password Message

TC_004 Successful Logout After Login
    Open Login Page
    Login With Valid Credentials
    Verify Success Login Message
    Logout From Secure Area
    Verify Logout Message