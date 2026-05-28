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
${WRONG_PASS}    WrongPassword123
${WRONG_USER}    wronguser
${ID_FIELD}      id=username
${PW_FIELD}      id=password
${LOGIN_BTN}     css=button[type='submit']
${FLASH_MSG}     id=flash
${LOGOUT_BTN}    css=a.button.secondary.radius