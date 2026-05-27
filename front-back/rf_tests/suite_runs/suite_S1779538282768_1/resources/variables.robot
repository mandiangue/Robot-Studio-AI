*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_PASSWORD}    WrongPassword123
${INVALID_USERNAME}    invaliduser
${SUCCESS_MESSAGE}    You logged into a secure area!
${ERROR_MESSAGE_INVALID_PASSWORD}    Your password is invalid!
${ERROR_MESSAGE_INVALID_USERNAME}    Your username is invalid!
${USERNAME_FIELD}    id=username
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}    css=button[type="submit"]
${ALERT_MESSAGE}    css=.alert