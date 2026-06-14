*** Settings ***
Documentation    Variables for SauceDemo tests
Library    SeleniumLibrary

*** Variables ***
${URL}                      https://www.saucedemo.com
${BROWSER}                  chrome
${STANDARD_USER}            standard_user
${LOCKED_USER}              locked_out_user
${PASSWORD}                 secret_sauce
${FIRST_NAME}               John
${LAST_NAME}                Doe
${POSTAL_CODE}              12345
${USERNAME_INPUT}           id=user-name
${PASSWORD_INPUT}           id=password
${LOGIN_BUTTON}             id=login-button
${ERROR_MESSAGE}            css=h3[data-test="error"]
${INVENTORY_CONTAINER}      id=inventory_container
${SORT_DROPDOWN}            css=.product_sort_container
${PRODUCT_PRICE}            css=.inventory_item_price
${ADD_BACKPACK}             id=add-to-cart-sauce-labs-backpack
${ADD_BIKE_LIGHT}           id=add-to-cart-sauce-labs-bike-light
${ADD_BOLT_TSHIRT}          id=add-to-cart-sauce-labs-bolt-t-shirt
${CART_BADGE}               css=.shopping_cart_badge
${CART_LINK}                css=.shopping_cart_link
${CART_ITEM}                css=.cart_item
${CHECKOUT_BUTTON}          id=checkout
${FIRST_NAME_INPUT}         id=first-name
${LAST_NAME_INPUT}          id=last-name
${POSTAL_CODE_INPUT}        id=postal-code
${CONTINUE_BUTTON}          id=continue
${FINISH_BUTTON}            id=finish
${COMPLETE_HEADER}          css=.complete-header