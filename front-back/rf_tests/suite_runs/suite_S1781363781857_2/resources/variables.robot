*** Settings ***
Documentation    Variables

*** Variables ***
${BASE_URL}      https://the-internet.herokuapp.com/login
${BROWSER}       chromium
${HEADLESS}      ${False}
${VALID_USER}    tomsmith
${VALID_PASS}    SuperSecretPassword!
${WRONG_USER}    wronguser
${WRONG_PASS}    WrongPassword
${LOGIN_URL}     https://the-internet.herokuapp.com/login
${SECURE_URL}    https://the-internet.herokuapp.com/secure