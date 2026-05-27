*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for Login Test Suite

*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${LOGIN_PAGE}    ${BASE_URL}/login
${SECURE_PAGE}    ${BASE_URL}/secure
${BROWSER}    chrome
${USERNAME_INPUT}    id=username
${PASSWORD_INPUT}    id=password
${LOGIN_BUTTON}    xpath=//button[@type='submit']
${LOGOUT_BUTTON}    xpath=//a[@href='/logout']
${SUCCESS_MESSAGE}    xpath=//div[@id='flash' and contains(text(), 'You logged into a secure area!')]
${LOGOUT_MESSAGE}    xpath=//div[@id='flash' and contains(text(), 'You logged out of the secure area!')]
${ERROR_PASSWORD_MESSAGE}    xpath=//div[@id='flash' and contains(text(), 'Your password is invalid!')]
${ERROR_USERNAME_MESSAGE}    xpath=//div[@id='flash' and contains(text(), 'Your username is invalid!')]