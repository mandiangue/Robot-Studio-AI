*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}         https://the-internet.herokuapp.com/login
${BROWSER}          chrome
${USERNAME}         tomsmith
${PASSWORD}         SuperSecretPassword!
${WRONG_PASSWORD}   Superpassword!
${WRONG_USERNAME}   johnsmith
${USERNAME_FIELD}   id=username
${PASSWORD_FIELD}   id=password
${LOGIN_BUTTON}     xpath=//button[@class='radius']
${LOGOUT_BUTTON}    css=.button.secondary.radius
${FLASH_MESSAGE}    id=flash