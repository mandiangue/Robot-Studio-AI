*** Settings ***
Suite Setup    Register Keyword To Run On Failure    Capture Page Screenshot
Documentation    Tests Main
Library    SeleniumLibrary
Resource    ../resources/variables.robot
Resource    ../resources/keywords.robot



*** Test Cases ***
TC_001 - Successful Login With Valid Credentials
    [Documentation]    User logs in with valid credentials and is redirected to the secure area.

    When User Enters Username    ${USERNAME_VALID}
    And User Enters Password    ${PASSWORD_VALID}
    And User Clicks Login Button
    Then User Should Be Redirected To Secure Area
    And User Should See Success Message

TC_002 - Failed Login With Invalid Username
    [Documentation]    User attempts login with an invalid username and sees an error message.

    When User Enters Username    ${USERNAME_INVALID}
    And User Enters Password    ${PASSWORD_VALID}
    And User Clicks Login Button
    Then User Should See Invalid Username Message
    And User Should Remain On Login Page

TC_003 - Failed Login With Invalid Password
    [Documentation]    User attempts login with an invalid password and sees an error message.

    When User Enters Username    ${USERNAME_VALID}
    And User Enters Password    ${PASSWORD_INVALID}
    And User Clicks Login Button
    Then User Should See Invalid Password Message
    And User Should Remain On Login Page

TC_004 - Successful Logout After Login
    [Documentation]    User logs in successfully and then logs out from the secure area.

    When User Enters Username    ${USERNAME_VALID}
    And User Enters Password    ${PASSWORD_VALID}
    And User Clicks Login Button
    Then User Should Be Redirected To Secure Area
    When User Clicks Logout Button
    Then User Should Be Redirected To Login Page
    And User Should See Logout Message