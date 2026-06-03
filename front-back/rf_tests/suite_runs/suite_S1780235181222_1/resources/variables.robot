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
${WRONG_USER}     wronguser
${WRONG_PASS}     WrongPassword123
${USERNAME_FIELD}    id=username
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}      css=button[type='submit']
${SUCCESS_MSG}       You logged into a secure area!
${INVALID_USER_MSG}  Your username is invalid!
${INVALID_PASS_MSG}  Your password is invalid!
${LOGOUT_MSG}        You logged out of the secure area!
${LOGOUT_BUTTON}     css=a.button[href='/logout']
${FLASH_MSG}         id=flash