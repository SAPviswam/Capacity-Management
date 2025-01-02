sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent"
],
    function (Controller, MessageToast, UIComponent) {
        "use strict";

    return Controller.extend("com.app.artihcus.controller.Home", {
        onInit() {
        },
        onLogin: async function () {
            // MessageToast.show("Login button clicked");
            // Navigate to login page or handle login logic
            if (!this.oLoginDialog) {
                this.oLoginDialog = await this.loadFragment("login");
            }
            this.oLoginDialog.open();

        },
        oncancelbtn: function () {
            if (this.oLoginDialog.isOpen()) {
                this.oLoginDialog.close();
            }
        },
        onSignup: async function () {
            if (!this.oSignUpDialog) {
                this.oSignUpDialog = await this.loadFragment("SignUp");
            }

            this.oSignUpDialog.open();

        },
        onCancelPressInSignUp: function () {
            if (this.oSignUpDialog.isOpen()) {
                this.oSignUpDialog.close();
            }
        },
        onLoginBtnPressInLoginDialog: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("InitialPage");

        },
        //  change password fragment loading
  onChangePasswordBtn: async function () {
    this.oLoginDialog.close();
    if (!this.oChangePasswordDialog) {
      this.oChangePasswordDialog = await this.loadFragment("ChangePassword");
    }
    this.oChangePasswordDialog.open();
  },
  onPressCancelInChangePassword: function () {
    this.byId("idChangePasswordDialog").close();
    this.byId("idconnectsapdialogbox_CS1").open();

  }
    });
});