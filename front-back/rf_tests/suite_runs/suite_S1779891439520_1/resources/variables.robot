*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}       https://the-internet.herokuapp.com/login
${BROWSER}        chrome
${USERNAME}       tomsmith
${PASSWORD}       SuperSecretPassword!
${WRONG_PASS}     WrongPassword123
${WRONG_USER}     wronguser
${INPUT_USER}     id=username
${INPUT_PASS}     id=password
${BTN_LOGIN}      css=button[type='submit']
${BTN_LOGOUT}     css=.button.secondary.radius
${MSG_FLASH}      id=flash
${SUCCESS_LOGIN}  You logged into a secure area!
${ERROR_PASS}     Your password is invalid!
${ERROR_USER}     Your username is invalid!
${SUCCESS_LOGOUT}    You logged out of the secure area!
${SECURE_URL}     https://the-internet.herokuapp.com/secure