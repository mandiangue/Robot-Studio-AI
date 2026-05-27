*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for Login Application Tests

*** Variables ***
${BASE_URL}                          https://the-internet.herokuapp.com/login
${LOGIN_URL}                         ${BASE_URL}/login
${SECURE_AREA_URL}                   ${BASE_URL}/secure
${BROWSER}                           chrome
${VALID_USERNAME}                    tomsmith
${VALID_PASSWORD}                    SuperSecretPassword!
${INVALID_PASSWORD}                  WrongPassword123
${INVALID_USERNAME}                  wronguser
${USERNAME_FIELD_LOCATOR}            id=username
${PASSWORD_FIELD_LOCATOR}            id=password
${LOGIN_BUTTON_LOCATOR}              xpath=//button[@class="radius"]
${LOGOUT_BUTTON_LOCATOR}             css=a.button
${SUCCESS_MESSAGE_LOCATOR}           id=flash
${ERROR_MESSAGE_LOCATOR}             id=flash
${SUCCESS_TEXT}                      You logged into a secure area!
${ERROR_INVALID_PASSWORD}            Your password is invalid!
${ERROR_INVALID_USERNAME}            Your username is invalid!
${LOGOUT_MESSAGE}                    You logged out of the secure area!