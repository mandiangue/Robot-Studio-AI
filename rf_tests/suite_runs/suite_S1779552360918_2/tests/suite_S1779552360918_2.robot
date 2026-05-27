*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation       Tests fonctionnels SauceDemo — BDD style
Library             SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779552360918_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779552360918_2/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    [Documentation]    Vérifie qu'un utilisateur valide est redirigé vers la page inventaire après connexion.
    [Tags]             login    smoke

    When Enter Valid Credentials
    And Submit Login Form
    Then Inventory Page Should Be Displayed

TC_002 — Add A Product To The Cart
    [Documentation]    Vérifie que le badge panier affiche 1 et le bouton devient Remove après ajout du premier produit.
    [Tags]             cart    smoke

    And Enter Valid Credentials
    And Submit Login Form
    And Inventory Page Should Be Displayed
    When Add First Product To Cart
    Then Cart Badge Should Show One
    And First Product Button Should Be Remove

TC_003 — Failed Login With Invalid Credentials
    [Documentation]    Vérifie qu'un message d'erreur s'affiche et que l'utilisateur reste sur la page de connexion.
    [Tags]             login    negative

    When Enter Invalid Credentials
    And Submit Login Form
    Then Login Error Should Be Displayed
    And User Should Remain On Login Page