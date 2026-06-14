*** Settings ***
Documentation    Variables

*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_USERNAME}    wronguser
${INVALID_PASSWORD}    wrongpassword
${USERNAME_INPUT}    id=username
${PASSWORD_INPUT}    id=password
${LOGIN_BUTTON}    css=button[type="submit"]
${LOGOUT_BUTTON}    css=a.button.secondary.radius
${FLASH_MESSAGE}    id=flash
${SECURE_AREA_HEADER}    css=div#content h2