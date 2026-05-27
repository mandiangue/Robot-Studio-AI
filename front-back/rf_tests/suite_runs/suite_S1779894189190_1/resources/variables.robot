*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}      https://the-internet.herokuapp.com/login
${BROWSER}       chrome
${USERNAME}      tomsmith
${PASSWORD}      SuperSecretPassword!
${WRONG_PASSWORD}    WrongPassword123
${WRONG_USERNAME}    wronguser
${USERNAME_FIELD}    id=username
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}      css=button[type='submit']
${SUCCESS_MESSAGE}   css=div#flash
${LOGOUT_BUTTON}     css=a.button.secondary.radius
${FLASH_MESSAGE}     css=div#flash