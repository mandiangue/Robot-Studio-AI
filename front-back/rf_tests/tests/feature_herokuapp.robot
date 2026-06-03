*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot



*** Test Cases ***
TC_001 — Connexion réussie avec identifiants valides

    When Enter Valid Credentials
    And Click On Login Button
    Then User Should Be Redirected To Secure Page

TC_002 — Échec de connexion avec identifiant invalide

    When Enter Invalid Username Credentials
    And Click On Login Button
    Then Invalid Username Error Should Be Displayed

TC_003 — Échec de connexion avec mot de passe invalide

    When Enter Invalid Password Credentials
    And Click On Login Button
    Then Invalid Password Error Should Be Displayed

TC_004 — Déconnexion après une connexion réussie

    When Enter Valid Credentials
    And Click On Login Button
    And Click On Logout Button
    Then User Should Be Redirected To Login Page After Logout