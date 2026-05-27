*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Variables for Login Test Suite

*** Variables ***
${BASE_URL}                          https://the-internet.herokuapp.com/login
${BROWSER}                           chrome
${VALID_USERNAME}                    tomsmith
${VALID_PASSWORD}                    SuperSecretPassword!
${INVALID_PASSWORD}                  SuperSecretPassword
${INVALID_USERNAME}                  avec
${LOGIN_URL}                         https://the-internet.herokuapp.com/login
${SECURE_URL}                        https://the-internet.herokuapp.com/secure
${SUCCESS_MESSAGE}                   You logged into a secure area!
${ERROR_MESSAGE_PASSWORD}            Your password is invalid!
${ERROR_MESSAGE_USERNAME}            Your username is invalid!
${USERNAME_FIELD_ID}                 username
${PASSWORD_FIELD_ID}                 password
${LOGIN_BUTTON_XPATH}                //button[@type='submit']
${SUCCESS_MESSAGE_XPATH}             //div[@class='flash success']
${ERROR_MESSAGE_XPATH}               //div[@class='flash error']