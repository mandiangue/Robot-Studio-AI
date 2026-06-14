*** Settings ***


Documentation     Tests for the-internet.herokuapp.com login feature
Library           Browser
Resource          ../resources/variables.robot
Resource          ../resources/keywords.robot
Resource          ../resources/pages/main_page.robot

*** Test Cases ***
TC_001 Connexion Reussie Avec Identifiants Valides
    [Documentation]    Successful login with valid credentials
    When Login With Credentials    ${VALID_USERNAME}    ${VALID_PASSWORD}
    Then Verify Successful Login

TC_002 Connexion Echouee Avec Mot De Passe Invalide
    [Documentation]    Failed login with invalid password
    When Login With Credentials    ${VALID_USERNAME}    ${INVALID_PASSWORD}
    Then Verify Invalid Password Error

TC_003 Connexion Echouee Avec Nom D Utilisateur Invalide
    [Documentation]    Failed login with invalid username
    When Login With Credentials    ${INVALID_USERNAME}    ${VALID_PASSWORD}
    Then Verify Invalid Username Error

TC_004 Tentative De Connexion Avec Champs Vides
    [Documentation]    Login attempt with empty fields
    When Login With Credentials    ${EMPTY}    ${EMPTY}
    Then Verify Invalid Username Error

TC_005 Deconnexion Apres Une Connexion Reussie
    [Documentation]    Logout after successful login
    Given Login With Credentials    ${VALID_USERNAME}    ${VALID_PASSWORD}
    And Verify Successful Login
    When Logout From Secure Area
    Then Verify Successful Logout
