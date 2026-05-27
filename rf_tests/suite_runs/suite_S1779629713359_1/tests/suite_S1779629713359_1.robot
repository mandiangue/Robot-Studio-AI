*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for login and logout scenarios on the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629713359_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779629713359_1/resources/keywords.robot


*** Test Cases ***
TC_001 — Connexion avec identifiants valides

    When Enter Valid Credentials
    And Submit Login Form
    Then Verify User Is Logged In Successfully

TC_002 — Connexion avec un mot de passe incorrect

    When Enter Credentials With Wrong Password
    And Submit Login Form
    Then Verify Invalid Password Error Is Displayed

TC_003 — Connexion avec un nom d'utilisateur incorrect

    When Enter Credentials With Wrong Username
    And Submit Login Form
    Then Verify Invalid Username Error Is Displayed

TC_004 — Déconnexion après une connexion réussie

    When Enter Valid Credentials
    And Submit Login Form
    And Logout From Secure Area
    Then Verify User Is Logged Out Successfully