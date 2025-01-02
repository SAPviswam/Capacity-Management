sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent"
],
    function (Controller, MessageToast, UIComponent) {
        "use strict";

        return Controller.extend("com.app.capacity.controller.Home", {
            onInit() {
            },
            //*********************************Login Button in Home Page Start *********************************/
            onPressLogin: async function () {
                if (!this.oLoginDialog) {
                    this.oLoginDialog = await this.loadFragment("login");
                }
                this.oLoginDialog.open();
            },
            //*********************************Login Button in Home Page End *********************************/
            //*********************************Login Form Cancel Button in login Fragment Start *********************************/
            onPressCancelLoginBtn: function () {
                if (this.oLoginDialog.isOpen()) {
                    this.oLoginDialog.close();
                }
            },
            //*********************************Login Form Cancel Button in login Fragment End *********************************/
            //*********************************SignUp Button in Home Page Start *********************************/
            onPressSignup: async function () {
                if (!this.oSignUpDialog) {
                    this.oSignUpDialog = await this.loadFragment("SignUp");
                }
                this.oSignUpDialog.open();
            },
            //*********************************SignUp Button in Home Page End *********************************/
            //*********************************SignUp Form Cancel Button in SignUp Fragment Start *********************************/
            onPressCancelSignUp: function () {
                if (this.oSignUpDialog.isOpen()) {
                    this.oSignUpDialog.close();
                }
            },
            //*********************************SignUp Form Cancel Button in SignUp Fragment End *********************************/
        });
    });