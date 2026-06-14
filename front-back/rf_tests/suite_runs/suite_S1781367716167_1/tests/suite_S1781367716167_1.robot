*** Settings ***


Documentation     Login feature tests for the-internet.herokuapp.com
Library           Browser
Resource          ../resources/variables.robot
Resource          ../resources/keywords.robot
Resource          ../resources/pages/main_page.robot

*** Test Cases ***
TC_001 Connexion Reussie Avec Identifiants Valides
    [Documentation]    Connexion réussie avec identifiants valides
    Given Login With Credentials    ${VALID_USERNAME}    ${VALID_PASSWORD}
    Then Verify Login Success

TC_002 Connexion Echouee Avec Identifiant Invalide
    [Documentation]    Connexion échouée avec identifiant invalide
    Given Login With Credentials    ${INVALID_USERNAME}    ${VALID_PASSWORD}
    Then Verify Login Failed With Invalid Username

TC_003 Connexion Echouee Avec Mot De Passe Invalide
    [Documentation]    Connexion échouée avec mot de passe invalide
    Given Login With Credentials    ${VALID_USERNAME}    ${INVALID_PASSWORD}
    Then Verify Login Failed With Invalid Password

TC_004 Deconnexion Apres Connexion Reussie
    [Documentation]    Déconnexion après une connexion réussie
    Given Login With Credentials    ${VALID_USERNAME}    ${VALID_PASSWORD}
    And Verify Login Success
    When Logout From Secure Area
    Then Verify Logout Success
