*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780228984239_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780228984239_2/resources/keywords.robot



*** Test Cases ***
TC_001 — Connexion avec un utilisateur verrouillé
    Given The Login Page Is Open
    When The User Logs In With Locked Account
    Then An Error Message Should Indicate The Account Is Locked

TC_002 — Tri des produits par prix croissant
    Given The Login Page Is Open
    When The User Logs In With Standard Account
    Then The Inventory Page Should Be Displayed
    When The User Sorts Products By Price Low To High
    Then The Products Should Be Ordered By Ascending Price

TC_003 — Suppression d'un article du panier
    Given The Login Page Is Open
    When The User Logs In With Standard Account
    Then The Inventory Page Should Be Displayed
    When The User Adds The First Product To The Cart
    When The User Opens The Cart
    When The User Removes The Product From The Cart
    Then The Cart Should Be Empty