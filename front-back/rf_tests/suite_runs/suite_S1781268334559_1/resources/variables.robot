*** Settings ***
Documentation    Variables globales du projet

*** Variables ***
${BASE_URL}             https://www.saucedemo.com
${URL}                  https://www.saucedemo.com
${BROWSER}              chrome

${USERNAME_INPUT}       id=user-name
${PASSWORD_INPUT}       id=password
${LOGIN_BUTTON}         id=login-button

${PROBLEM_USER}         problem_user
${STANDARD_USER}        standard_user
${PASSWORD}             secret_sauce

${INVENTORY_CONTAINER}  id=inventory_container
${SORT_DROPDOWN}        css=.product_sort_container
${INVENTORY_ITEM_PRICE} css=.inventory_item_price

${ADD_BACKPACK}         id=add-to-cart-sauce-labs-backpack
${ADD_BIKE_LIGHT}       id=add-to-cart-sauce-labs-bike-light
${ADD_BOLT_TSHIRT}      id=add-to-cart-sauce-labs-bolt-t-shirt
${REMOVE_BACKPACK}      id=remove-sauce-labs-backpack
${REMOVE_BACKPACK_CART} id=remove-sauce-labs-backpack

${CART_BADGE}           css=.shopping_cart_badge
${CART_LINK}            css=.shopping_cart_link
${CART_ITEM}            css=.cart_item

${CHECKOUT_BUTTON}      id=checkout
${FIRST_NAME_INPUT}     id=first-name
${LAST_NAME_INPUT}      id=last-name
${POSTAL_CODE_INPUT}    id=postal-code
${CONTINUE_BUTTON}      id=continue
${FINISH_BUTTON}        id=finish
${ERROR_MESSAGE}        css=h3[data-test="error"]
${CONFIRMATION_HEADER}  css=.complete-header