*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests pour la fonctionnalité de connexion
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533200208_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533200208_1/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    [Documentation]    Vérifier que l'utilisateur peut se connecter avec les identifiants valides

    Login With Valid Credentials
    Verify User Successfully Logged In


TC_002 Failed Login With Invalid Password
    [Documentation]    Vérifier que la connexion échoue avec un password incorrect

    Login With Invalid Password
    Verify Password Error Message


TC_003 Failed Login With Invalid Username
    [Documentation]    Vérifier que la connexion échoue avec un username incorrect

    Login With Invalid Username
    Verify Username Error Message