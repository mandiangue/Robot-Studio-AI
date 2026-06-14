*** Settings ***
Documentation    Variables

*** Variables ***
${BASE_URL}            https://the-internet.herokuapp.com/login
${BROWSER}             chromium
${HEADLESS}            ${False}
${VALID_USERNAME}      tomsmith
${VALID_PASSWORD}      SuperSecretPassword!
${INVALID_USERNAME}    wronguser
${INVALID_PASSWORD}    WrongPassword
${MSG_LOGIN_SUCCESS}     You logged into a secure area!
${MSG_LOGOUT_SUCCESS}    You logged out of the secure area!
${MSG_INVALID_USER}      Your username is invalid!
${MSG_INVALID_PASS}      Your password is invalid!


