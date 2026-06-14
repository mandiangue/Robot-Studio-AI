*** Settings ***
Documentation    Variables

*** Variables ***
${BASE_URL}              https://the-internet.herokuapp.com/login
${URL}                   https://the-internet.herokuapp.com/login
${BROWSER}               chromium
${HEADLESS}              ${False}
${VALID_USERNAME}        tomsmith
${VALID_PASSWORD}        SuperSecretPassword!
${INVALID_USERNAME}      mauvaisUser
${INVALID_PASSWORD}      MauvaisMotDePasse
${SUCCESS_MESSAGE}       You logged into a secure area!
${INVALID_PASSWORD_MSG}  Your password is invalid!
${INVALID_USERNAME_MSG}  Your username is invalid!
${LOGOUT_MESSAGE}        You logged out of the secure area!
${SECURE_URL}            https://the-internet.herokuapp.com/secure


