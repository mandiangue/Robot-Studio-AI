*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}       https://the-internet.herokuapp.com/login
${URL}            https://the-internet.herokuapp.com/login
${BROWSER}        chrome
${USERNAME}       tomsmith
${PASSWORD}       SuperSecretPassword!
${WRONG_PASS}     WrongPassword123
${WRONG_USER}     wronguser
${INPUT_USER}     id=username
${INPUT_PASS}     id=password
${BTN_LOGIN}      css=button[type='submit']
${BTN_LOGOUT}     css=.button.secondary.radius
${MSG_SUCCESS}    You logged into a secure area!
${MSG_LOGOUT}     You logged out of the secure area!
${MSG_BAD_PASS}   Your password is invalid!
${MSG_BAD_USER}   Your username is invalid!
${FLASH_MSG}      id=flash