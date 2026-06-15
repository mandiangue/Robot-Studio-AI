*** Settings ***
Documentation    Variables

*** Variables ***
${BASE_URL}                 https://the-internet.herokuapp.com/login
${BROWSER}                  chrome
${USERNAME_VALID}           tomsmith
${PASSWORD_VALID}           SuperSecretPassword!
${USERNAME_INVALID}         wronguser
${PASSWORD_INVALID}         wrongpassword
${USERNAME_INPUT}           id=username
${PASSWORD_INPUT}           id=password
${LOGIN_BUTTON}             css=button[type="submit"]
${LOGOUT_BUTTON}            css=a.button[href="/logout"]
${FLASH_MESSAGE}            id=flash
${SECURE_AREA_URL}          https://the-internet.herokuapp.com/secure
${LOGIN_URL}                https://the-internet.herokuapp.com/login
${MSG_LOGIN_SUCCESS}        You logged into a secure area!
${MSG_INVALID_USERNAME}     Your username is invalid!
${MSG_INVALID_PASSWORD}     Your password is invalid!
${MSG_LOGOUT_SUCCESS}       You logged out of the secure area!