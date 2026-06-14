***** FILE: resources/variables.robot
*** Settings ***
Documentation    Variables for Login Tests

*** Variables ***
${URL}                          https://the-internet.herokuapp.com/login
${BROWSER}                      chromium
${HEADLESS}                     False
${VALID_USERNAME}               tomsmith
${VALID_PASSWORD}               SuperSecretPassword!
${INVALID_USERNAME}             wronguser
${INVALID_PASSWORD}             WrongPass123
${USERNAME_FIELD}               id=username
${PASSWORD_FIELD}               id=password
${LOGIN_BUTTON}                 css=[type="submit"]
${ERROR_MESSAGE}                css=.error
${SUCCESS_MESSAGE}              css=.subheader
${LOGOUT_BUTTON}                css=.button.secondary.radius
${SECURE_URL}                   https://the-internet.herokuapp.com/secure


***** FILE: resources/pages/login.robot
*** Settings ***
Documentation    Page Object for Login Page
Library          Browser
Resource         ../variables.robot

*** Keywords ***
Enter Username
    [Arguments]    ${username}
    Fill Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Fill Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click    ${LOGIN_BUTTON}

Get Error Message
    ${message}=    Get Text    ${ERROR_MESSAGE}
    [Return]    ${message}

Get Success Message
    ${message}=    Get Text    ${SUCCESS_MESSAGE}
    [Return]    ${message}

Click Logout Button
    Click    ${LOGOUT_BUTTON}

Verify User Is On Login Page
    Get Url    ==    ${URL}

Verify User Is On Secure Page
    Get Url    ==    ${SECURE_URL}


***** FILE: resources/keywords.robot
*** Settings ***
Library          Browser
Library          Collections
Resource         variables.robot
Resource         pages/login.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chromium
    New Browser    ${browser}    headless=${HEADLESS}
    New Context    acceptDownloads=True
    New Page       ${url}

Close Browser
    Close Context
    Close Browser

Login With Credentials
    [Arguments]    ${username}    ${password}
    Enter Username    ${username}
    Enter Password    ${password}
    Click Login Button


***** FILE: tests/tests.robot
*** Settings ***
Suite Setup       Open Browser No Popup    ${URL}    ${BROWSER}
Suite Teardown    Close Browser
Test Setup        Go To    ${URL}
Test Teardown     Take Screenshot
Documentation     Login Test Suite for The Internet Application
Library           Browser
Resource          ../resources/variables.robot
Resource          ../resources/keywords.robot
Resource          ../resources/pages/login.robot

*** Test Cases ***
TC_001 Connexion avec identifiants valides
    Given I am on the login page
    When I enter valid username and password
    And I click the login button
    Then I should be redirected to the secure page
    And I should see the success message

TC_002 Connexion avec identifiant invalide
    Given I am on the login page
    When I enter an invalid username with valid password
    And I click the login button
    Then I should see the invalid username error message
    And I should remain on the login page

TC_003 Connexion avec mot de passe invalide
    Given I am on the login page
    When I enter valid username with invalid password
    And I click the login button
    Then I should see the invalid password error message
    And I should remain on the login page

TC_004 Déconnexion après connexion réussie
    Given I am logged in with valid credentials
    When I click the logout button
    Then I should be redirected to the login page
    And I should see the logout confirmation message

*** Keywords ***
I am on the login page
    Verify User Is On Login Page

I enter valid username and password
    Login With Credentials    ${VALID_USERNAME}    ${VALID_PASSWORD}

I click the login button
    Click Login Button

I should be redirected to the secure page
    Verify User Is On Secure Page

I should see the success message
    ${message}=    Get Success Message
    Should Contain    ${message}    You logged into a secure area!

I enter an invalid username with valid password
    Enter Username    ${INVALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

I should see the invalid username error message
    ${message}=    Get Error Message
    Should Contain    ${message}    Your username is invalid!

I should remain on the login page
    Verify User Is On Login Page

I enter valid username with invalid password
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}

I should see the invalid password error message
    ${message}=    Get Error Message
    Should Contain    ${message}    Your password is invalid!

I am logged in with valid credentials
    Login With Credentials    ${VALID_USERNAME}    ${VALID_PASSWORD}
    Verify User Is On Secure Page

I should be redirected to the login page
    Verify User Is On Login Page

I should see the logout confirmation message
    ${message}=    Get Error Message
    Should Contain    ${message}    You logged out of the secure area!