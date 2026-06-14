*** Settings ***
Suite Setup    Register Keyword To Run On Failure    Capture Page Screenshot
Documentation     Test suite for login functionality on the-internet.herokuapp.com
Library           SeleniumLibrary
Resource          ../resources/variables.robot
Resource          ../resources/keywords.robot
Resource          ../resources/pages/main_page.robot

*** Test Cases ***
TC_001 — Connexion réussie avec identifiants valides
    Given Navigate To Login Page
    When Enter Username    ${VALID_USER}
    And Enter Password    ${VALID_PASS}
    And Click Login Button
    Then Verify Successful Login

TC_002 — Échec de connexion avec un identifiant invalide
    Given Navigate To Login Page
    When Enter Username    ${WRONG_USER}
    And Enter Password    ${VALID_PASS}
    And Click Login Button
    Then Verify Invalid Username Error

TC_003 — Échec de connexion avec un mot de passe invalide
    Given Navigate To Login Page
    When Enter Username    ${VALID_USER}
    And Enter Password    ${WRONG_PASS}
    And Click Login Button
    Then Verify Invalid Password Error

TC_004 — Déconnexion après une connexion réussie
    Given Navigate To Login Page
    When Enter Username    ${VALID_USER}
    And Enter Password    ${VALID_PASS}
    And Click Login Button
    And Verify Successful Login
    When Click Logout Button
    Then Verify Successful Logout