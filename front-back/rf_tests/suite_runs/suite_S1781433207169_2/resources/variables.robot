*** Settings ***
Documentation    Variables

*** Variables ***
${BASE_URL}    https://www.saucedemo.com
${URL}         https://www.saucedemo.com
${BROWSER}     chromium

${STANDARD_USER}      standard_user
${PROBLEM_USER}       problem_user
${PASSWORD}           secret_sauce

${USERNAME_INPUT}     id=user-name
${PASSWORD_INPUT}     id=password
${LOGIN_BUTTON}       id=login-button

${INVENTORY_CONTAINER}    id=inventory_container
${SORT_DROPDOWN}          css=.product_sort_container
${INVENTORY_ITEM_PRICE}   css=.inventory_item_price

${ADD_BACKPACK_BTN}       id=add-to-cart-sauce-labs-backpack
${CART_LINK}              css=.shopping_cart_link
${CART_BADGE}             css=.shopping_cart_badge
${REMOVE_BACKPACK_BTN}    id=remove-sauce-labs-backpack

${BURGER_MENU_BTN}        id=react-burger-menu-btn
${LOGOUT_LINK}            id=logout_sidebar_link

${CHECKOUT_BUTTON}        id=checkout
${FIRST_NAME_INPUT}       id=first-name
${LAST_NAME_INPUT}        id=last-name
${POSTAL_CODE_INPUT}      id=postal-code
${CONTINUE_BUTTON}        id=continue
${FINISH_BUTTON}          id=finish
${CONFIRMATION_HEADER}    css=.complete-header
${ERROR_MESSAGE}          css=h3[data-test='error']