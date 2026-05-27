*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for Login Test Automation

*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${USERNAME_FIELD}    id=username
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}    xpath=//button[@type='submit']
${SUCCESS_MESSAGE}    xpath=//div[@id='flash' and contains(text(), 'You logged into a secure area!')]
${ERROR_MESSAGE_PASSWORD}    xpath=//div[@id='flash' and contains(text(), 'Your password is invalid!')]
${ERROR_MESSAGE_USERNAME}    xpath=//div[@id='flash' and contains(text(), 'Your username is invalid!')]
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_PASSWORD}    WrongPassword
${INVALID_USERNAME}    wronguser
${SECURE_AREA_URL}    https://the-internet.herokuapp.com/secure