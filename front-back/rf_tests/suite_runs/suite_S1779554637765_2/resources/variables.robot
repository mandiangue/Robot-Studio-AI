*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}       https://the-internet.herokuapp.com/login
${BROWSER}        chrome
${USERNAME}       tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_PASSWORD}    SuperSecretPassword
${INVALID_USERNAME}    avec
${USERNAME_FIELD}    id=username
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}      xpath=//button[@class='radius']
${SUCCESS_MESSAGE}   css=#flash.success
${ERROR_MESSAGE}     css=#flash.error
${EXPECTED_SUCCESS_TEXT}    You logged into a secure area!
${EXPECTED_INVALID_PASSWORD_TEXT}    Your password is invalid!
${EXPECTED_INVALID_USERNAME_TEXT}    Your username is invalid!
${SECURE_URL}        https://the-internet.herokuapp.com/secure