*** Settings ***
Documentation    Variables

*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${USERNAME_INPUT}    id=username
${PASSWORD_INPUT}    id=password
${LOGIN_BUTTON}    css=button[type='submit']
${LOGOUT_BUTTON}    css=a.button.secondary.radius
${FLASH_MESSAGE}    id=flash
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_USERNAME}    wronguser
${INVALID_PASSWORD}    WrongPassword
${SUCCESS_LOGIN_MESSAGE}    You logged into a secure area!
${INVALID_USERNAME_MESSAGE}    Your username is invalid!
${INVALID_PASSWORD_MESSAGE}    Your password is invalid!
${LOGOUT_MESSAGE}    You logged out of the secure area!