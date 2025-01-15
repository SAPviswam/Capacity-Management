sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
],
    function (BaseController, MessageToast, MessageBox, UIComponent, JSONModel) {
        "use strict";


        return BaseController.extend("com.app.capacity.controller.Home", {
            async onInit() {
                if (!this._LoadingDialog) {
                    this._LoadingDialog = new sap.m.BusyDialog({
                        text: "Please wait while loading"
                    });
                    this._LoadingDialog.open()
                }
                const oUserModel = new JSONModel({
                    userID: "",
                    fName: "",
                    lName: "",
                    phoneNo: "",
                    mailID: "",
                    password: "",
                    expireDate: "",
                    profileImage: ""
                });
                // Set the combined model to the view
                this.getView().setModel(oUserModel, "UserModel")
                // Check credentials are saved
                await this.checkAutoLogin()
                this._LoadingDialog.close()

                const oConfigModel = this.getOwnerComponent().getModel("config");
                this.oTwilioConfig = oConfigModel.getProperty("/Twilio");
                this.oSMSConfig = oConfigModel.getProperty("/SMS");

            },

            checkAutoLogin: async function () {

                const savedData = localStorage.getItem('loginData');
                if (savedData) {
                    const { userID, token, expiration } = JSON.parse(savedData);

                    // Check if data is expired
                    if (Date.now() > expiration) {
                        console.log('Login data has expired');
                        localStorage.removeItem('loginData');
                        sap.m.MessageToast.show("Login expired")
                        return null;
                    }

                    try {
                        const oModel = this.getOwnerComponent().getModel("ModelV2")
                        const fUser = new sap.ui.model.Filter("userID", sap.ui.model.FilterOperator.EQ, userID),
                            fPassword = new sap.ui.model.Filter("password", sap.ui.model.FilterOperator.EQ, token),
                            aFilters = new sap.ui.model.Filter({
                                filters: [fUser, fPassword],
                                and: true
                            });
                        const oResponse = await this.readData(oModel, "/Users", aFilters)
                        if (oResponse.results.length === 1) {
                            // Show success message
                            sap.m.MessageToast.show("Welcome back");

                            // Navigate to the Initial Screen
                            const oRouter = this.getOwnerComponent().getRouter();
                            oRouter.navTo("MainPage",{id:userID});
                        }
                    } catch (error) {
                        sap.m.MessageToast.show("Oops something went wrong please refresh the page");
                        console.error(error);
                    }
                }

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
                    this.getView().getModel("UserModel").setProperty("/", {})
                    this.oSignUpDialog.close();

                }
            },

            // for forgot password dialog box opens
            onForgotPasswordPress: async function () {
                if (!this.oForgotPasswordDialog) {
                    this.oForgotPasswordDialog = await this.loadFragment("ForgotPassword");
                }

                this.oForgotPasswordDialog.open();
            },

            onCancelBtnPressForgotPassword: function () {
                if (this.oForgotPasswordDialog.isOpen()) {
                    this.oForgotPasswordDialog.close();
                }
            },

            onLoginBtnPressInLoginDialog: async function () {
                const oModel = this.getOwnerComponent().getModel("ModelV2"),
                    oUserView = this.getView(),
                    sPath = "/Users",
                    sUserEnteredUserID = this.getView().byId("_IDGenInput11").getValue(),
                    sUserEnteredPassword = this.getView().byId("_IDGenInput221").getValue();


                // validations
                // test
                const aUserInputs = [
                    { Id: "_IDGenInput11", value: sUserEnteredUserID, regex: null, message: "Please enter registered user ID" },
                    { Id: "_IDGenInput221", value: sUserEnteredPassword, regex: null, message: "Enter your password" }
                ],
                    raisedErrors = [];

                aUserInputs.forEach(async input => {
                    let aValidations = this.validateField(oUserView, input.Id, input.value, input.regex, input.message)
                    if (aValidations.length > 0) {
                        raisedErrors.push(aValidations[0]) // pushning error into empty array
                    }
                })

                if (raisedErrors.length > 0) {
                    for (let error of raisedErrors) {
                        MessageBox.information(error) // showing error msg 
                        return;
                    }
                }
                // test
                const fUser = new sap.ui.model.Filter("userID", sap.ui.model.FilterOperator.EQ, sUserEnteredUserID),
                    // fPassword = new sap.ui.model.Filter("Password", sap.ui.model.FilterOperator.EQ, sUserEnteredPassword),
                    aFilters = new sap.ui.model.Filter({
                        filters: [fUser],
                        and: true // Change to false if you want OR logic
                    });

                // create busy dialog
                if (!this._oBusyDialog) {
                    this._oBusyDialog = new sap.m.BusyDialog({
                        text: "Authenticating"
                    });
                }
                try {
                    // Open busy dialog
                    this._oBusyDialog.open();

                    // Simulate buffer using setTimeout
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    // Fetch data from the model
                    const oResponse = await this.readData(oModel, sPath, aFilters);

                    if (oResponse.results.length > 0) {
                        const oResult = oResponse.results[0],
                            sStoredUserId = oResult.userID,
                            sStoredPassword = oResult.password;

                        // Encrypt user-entered password with SHA256
                        const sEncryptedPass = CryptoJS.SHA256(sUserEnteredPassword).toString();

                        if (sUserEnteredUserID === sStoredUserId && sStoredPassword === sEncryptedPass) {
                            // Auto Save 
                            const oCheckbox = this.getView().byId("_IDGenChe22ckBox");
                            if (oCheckbox.getSelected()) {
                                await this.onAutoSaveData(sUserEnteredUserID, sStoredPassword)
                            }
                            this._onLoginSuccess(sUserEnteredUserID);
                        } else {
                            this._onLoginFail("Authentication failed");
                        }
                    } else {
                        this._onLoginFail("User ID not found");
                    }
                } catch (error) {
                    this._oBusyDialog.close();
                    sap.m.MessageToast.show("Something went wrong. Please try again later.");
                    console.error("Error Found:", error);
                } finally {
                    // Close busy dialog
                    this._oBusyDialog.close();
                }
            },
            _onLoginSuccess(sUserEnteredUserID) {
                // Clear input fields

                this.getView().byId("_IDGenInput11").setValue("");
                this.getView().byId("_IDGenInput221").setValue("");

                // Show success message
                sap.m.MessageToast.show("Login Successfull");

                // Navigate to the Initial Screen
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("MainPage", { id: sUserEnteredUserID });
                // window.location.reload(true);

            },
            _onLoginFail(sMessage) {
                // Show failure message
                sap.m.MessageToast.show(sMessage);
            },
            onAutoSaveData: function (CurrentUser, Token) {
                // Save credentials with an expiration time 

                const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // Current time + expiration time in ms( hr * min * sec * millisec )

                const loginData = {
                    userID: CurrentUser,
                    token: Token,
                    expiration: expirationTime
                };

                // Save to local storage as a JSON string
                localStorage.setItem('loginData', JSON.stringify(loginData));

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

            },
            onAfterNumberEnter: function () {
                const value = this.getView().byId("_IDGenInpuseft4").getValue()
                if (!value || !value.length === 10) {
                    this.getView().byId("idOTPBtn").setEnabled(false)
                } else {
                    this.getView().byId("idOTPBtn").setEnabled(true)
                }
            },
            onGetOTPPress: function () {
                const oUserView = this.getView(),
                    sPhnNumber = oUserView.byId("_IDGenInpuseft4").getValue()
                var flag = true;
                if (!sPhnNumber || sPhnNumber.length !== 10 || !/^[6-9]\d{9}$/.test(sPhnNumber)) {
                    oUserView.byId("_IDGenInpuseft4").setValueState("Error");
                    oUserView.byId("_IDGenInpuseft4").setValueStateText("please enter 10 digit correct number");
                    flag = false;
                } else {
                    oUserView.byId("_IDGenInpuseft4").setValueState("None");
                }
                if (!flag) {
                    sap.m.MessageBox.information("Enter correct phone number")
                    return;
                }

                // Prepare the Twilio API details
                var formattedPhoneNumber = "+91" + sPhnNumber; // Assuming country code for India
                const accountSid = this.oTwilioConfig.AccountSID;  // Constant.oAccountSID;
                const authToken = this.oTwilioConfig.AuthToken;   // Constant.oAuthToken;
                const serviceSid = this.oTwilioConfig.ServiceID;   // Constant.oServiceID;
                const url = `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;

                // Prepare the data for the request
                const payload = {
                    To: formattedPhoneNumber,
                    Channel: 'sms'
                };

                var that = this;

                // Make the AJAX request to Twilio to send the OTP
                $.ajax({
                    url: url,
                    type: 'POST',
                    headers: {
                        'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $.param(payload),
                    success: function (data) {
                        sap.m.MessageToast.show('OTP sent successfully!');

                        // Store the phone number for later use in OTP verification
                        that._storedPhoneNumber = formattedPhoneNumber;

                        // Open the OTP dialog
                        that.getView().byId("_IDGenregeHBosx5").setVisible(true);

                    }.bind(that),
                    error: function (xhr, status, error) {
                        oUserView.byId("_IDGenInpuseft4").setValueState(sap.ui.core.ValueState.Error)
                        oUserView.byId("_IDGenInpuseft4").setValueStateText("check your mobile number")
                        console.error('Error sending OTP:', error);
                        sap.m.MessageToast.show('Failed to send OTP')
                    }
                });

            },
            onValidateOTP: function () {

                const that = this;
                // Create a Busy Dialog instance
                if (!this._oValidatingBusyDialog) {
                    this._oValidatingBusyDialog = new sap.m.BusyDialog({
                        text: "Please wait while validatiing OTP"
                    });
                }
                // Open the Busy Dialog
                this._oValidatingBusyDialog.open();

                const oMobileinput = this.byId("_IDGenInpuseft4"),
                    oOtpInput = this.byId("_IDGenInrfgpuseft4"),
                    sEnteredOtp = oOtpInput.getValue();

                // Basic validation: Check if OTP is entered
                if (!sEnteredOtp) {
                    oOtpInput.setValueState(sap.ui.core.ValueState.Error);
                    oOtpInput.setValueStateText("Please enter OTP");
                    sap.m.MessageToast.show("Please enter OTP")
                    this._oValidatingBusyDialog.close();
                    return;
                }

                // Validate OTP: It should be exactly 6 digits
                var otpRegex = /^\d{6}$/;
                if (!otpRegex.test(sEnteredOtp)) {
                    oOtpInput.setValueState(sap.ui.core.ValueState.Error);
                    oOtpInput.setValueStateText("Please enter a valid 6-digit OTP.");
                    this._oValidatingBusyDialog.close();
                    return;
                }

                // Prepare the Twilio Verify Check API details
                const accountSid = this.oTwilioConfig.AccountSID,  // Constant.oAccountSID;
                    authToken = this.oTwilioConfig.AuthToken,   // Constant.oAuthToken;
                    serviceSid = this.oTwilioConfig.ServiceID,   // Constant.oServiceID;
                    url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
                    payload = {
                        To: this._storedPhoneNumber,
                        Code: sEnteredOtp
                    };

                // Make the AJAX request to Twilio to verify the OTP
                $.ajax({
                    url: url,
                    type: 'POST',
                    headers: {
                        'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $.param(payload),
                    success: function (data) {
                        if (data.status === "approved") {
                            // close the busy dailog
                            that._oValidatingBusyDialog.close();
                            // hide the validattion elements
                            that.getView().byId("_IDGenregeHBosx5").setVisible(false)
                            oOtpInput.setValue("")
                            oMobileinput.setValueState(sap.ui.core.ValueState.Success);
                            that.getView().byId("_IDGenButtson4").setEnabled(true)
                            that.getView().byId("idOTPBtn").setEnabled(false)
                            sap.m.MessageToast.show('OTP validation successfull...!');
                            this.getView().byId("_IDGenInpuseft4").setEditable(false)
                            // set otp input value state to none 
                            oOtpInput.setValueState("None");
                            // Proceed with further actions
                        } else {
                            // close the busy dailog
                            that._oValidatingBusyDialog.close();
                            oOtpInput.setValueState(sap.ui.core.ValueState.Error);
                            oOtpInput.setValueStateText("Invalid OTP");
                            sap.m.MessageToast.show('Invalid OTP...!');
                        }
                    }.bind(that),
                    error: function (xhr, status, error) {
                        that._oValidatingBusyDialog.close();
                        console.error('Error verifying OTP:', error);
                        sap.m.MessageToast.show('Failed to verify OTP: ' + error);

                    }
                })
            },

            onSignUpPress: async function () {

                const oPayload = this.getView().getModel("UserModel").getProperty("/"),
                    sPath = "/Users",
                    oModel = this.getOwnerComponent().getModel("ModelV2"),
                    oUserView = this.getView(),
                    that = this,
                    raisedErrors = [];
                // Validations
                const aUserInputs = [
                    { Id: "_IDGenInputd2", value: oPayload.fName, regex: /^[A-Za-z]{3,}$/, message: "Enter first name atleast 3 characters long (alphabets only)" },
                    { Id: "_IDGenInputd3", value: oPayload.lName, regex: /^[A-Za-z]{3,}$/, message: "Enter last name atleast 3 characters long (alphabets only)" },
                    { Id: "_IDGenInpust4", value: oPayload.mailID, regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Enter correct E-mail" },
                    { Id: "_IDGenInpuseft4", value: oPayload.phoneNo, regex: /^[6-9]\d{9}$/, message: "Enter correct phone number" },
                    {
                        Id: "_IDGenInputs5", value: oPayload.password, regex: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
                        message: "Password\n*At least 8 characters long.\n*Contains at least one Uppercase.\n*Contains at least one special character (e.g., @, #, $, etc.).\n*Contains at least one numeric digit."
                    }
                ];

                aUserInputs.forEach(async input => {
                    let aValidations = this.validateField(oUserView, input.Id, input.value, input.regex, input.message)
                    if (aValidations.length > 0) {
                        raisedErrors.push(aValidations[0]) // pushning error into empty array
                    }
                })

                if (raisedErrors.length > 0) {
                    for (let error of raisedErrors) {
                        MessageBox.information(error) // showing error msg 
                        return;
                    }
                }
                if (oPayload.password !== oUserView.byId("_IDGenInpust6").getValue()) {
                    sap.m.MessageBox.information("Password must match");
                    oUserView.byId("_IDGenInpust6").setValueState("Error")
                    oUserView.byId("_IDGenInpust6").setValueStateText("Password must match")
                    return;
                } else {
                    oUserView.byId("_IDGenInpust6").setValueState("None")
                }

                try {
                    const oResponse = await this.readData(oModel, sPath);
                    // Accessing the data in the response
                    const aResults = oResponse.results;
                    if (aResults.length === 0) {
                        oPayload.userID = "ARTDKN0001"
                    } else {
                        const aSortedarray = aResults.sort((a, b) => b.userID.localeCompare(a.userID)), // descendign order to get the highest number user id
                            currentMaxID = aSortedarray[0].userID
                        // generation of user ID
                        function generateUniqueString(currentString) {
                            // Extract the prefix (non-numeric part) and the number (numeric part)
                            const prefix = currentString.match(/[^\d]+/g)[0]; // Extract non-numeric characters
                            const number = parseInt(currentString.match(/\d+/g)[0], 10); // Extract numeric characters and convert to integer

                            // Increment the numeric part by 1
                            const newNumber = number + 1;

                            // Format the new number with leading zeros to match the original length
                            const formattedNumber = String(newNumber).padStart(currentString.length - prefix.length, '0');

                            // Combine the prefix and the formatted number to get the new unique string
                            return prefix + formattedNumber;
                        }
                        // call
                        const newuserID = generateUniqueString(currentMaxID);
                        oPayload.userID = newuserID

                    }

                    // // get the actual password
                    const sActualPass = oPayload.password
                    // Use SHA256 for hashing (CryptoJS )
                    const sEncrytpedPass = CryptoJS.SHA256(sActualPass).toString(); // encryption with CryptoJS
                    oPayload.password = sEncrytpedPass

                    // Create a record with payload
                    await this.createData(oModel, oPayload, sPath);
                    sap.m.MessageToast.show("Signup Successfull");
                    this.oSignUpDialog.close();
                    oUserView.byId("_IDGenInpust6").setValue("")
                    oUserView.byId("_IDGenInpuseft4").setEditable(true);
                    oUserView.byId("_IDGenButtson4").setEnabled(false)

                    // Send the generated UserID to User
                    // NOTE : Give credentilas here to send User ID to Registerd Mobile number 
                    const accountSid = this.oSMSConfig.AccountSID,
                        authToken = this.oSMSConfig.AuthToken,
                        url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                        fromNumber = '+12315089152';
                    $.ajax({
                        url: url,
                        type: 'POST',
                        async: true,
                        headers: {
                            'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken)
                        },
                        data: {
                            To: `+91${oPayload.phoneNo}`,
                            From: fromNumber,
                            Body: `Hi ${oPayload.Firstname} your login ID for Capacity Management Application is ${oPayload.userID} don't share with anyone. \nThank You,\nArtihcus Global.`
                        },
                        success: function (data) {
                            sap.m.MessageBox.information('Login ID will be sent via SMS to your mobile number');
                        },
                        error: function (error) {
                            sap.m.MessageBox.information(`Failed to send SMS.\nyour user ID is ${oPayload.userID} please note this for future use`);
                            console.error('Failed to send user ID' + error.message);
                        }
                    });
                    // SMS END
                    // set the empty data after successful creation
                    this.getView().getModel("UserModel").setProperty("/", {});
                } catch (error) {
                    sap.m.MessageToast.show("Something went wrong try again later....");
                    console.error("Failed to create record." + error);
                }
            },
            onUpdatePasswordPress: async function () {
                const oModel = this.getOwnerComponent().getModel("ModelV2"),
                    oUserView = this.getView(),
                    sPath = "/Users",
                    sUserEnteredUserID = this.getView().byId("UserIdInputForgotPassword_cs").getValue(),
                    sUserEnteredMobile = this.getView().byId("InputMobNoForgotPassword_cs").getValue(),
                    sUserEnteredPass = this.getView().byId("InputNewPasswordForgotPassword_cs").getValue(),
                    sConfirmPass = this.getView().byId("InputconfirmPasswordForgotPassword_cs").getValue();
                // validations
                const aUserInputs = [

                    { Id: "UserIdInputForgotPassword_cs", value: sUserEnteredUserID, regex: null, message: "Enter User ID" },
                    { Id: "InputMobNoForgotPassword_cs", value: sUserEnteredMobile, regex: /^\d+$/, message: "Enter registered mobile number" },
                    {
                        Id: "InputNewPasswordForgotPassword_cs", value: sUserEnteredPass, regex: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
                        message: "Password\n*At least 8 characters long.\n*Contains at least one Uppercase.\n*Contains at least one special character (e.g., @, #, $, etc.).\n*Contains at least one numeric digit."
                    }
                ],
                    raisedErrors = [];

                aUserInputs.forEach(async input => {
                    let aValidations = this.validateField(oUserView, input.Id, input.value, input.regex, input.message)
                    if (aValidations.length > 0) {
                        raisedErrors.push(aValidations[0]) // pushning error into empty array
                    }
                })

                if (raisedErrors.length > 0) {
                    for (let error of raisedErrors) {
                        MessageBox.information(error) // showing error msg 
                        return;
                    }
                }

                if (sUserEnteredPass !== sConfirmPass) {
                    MessageBox.information("password must match")
                    return
                }

                try {

                    const aRegisteredUserID = new sap.ui.model.Filter("userID", sap.ui.model.FilterOperator.EQ, sUserEnteredUserID);
                    const aRegisteredMobile = new sap.ui.model.Filter("phoneNo", sap.ui.model.FilterOperator.EQ, sUserEnteredMobile);

                    // Combine the filters with AND
                    const aFilters = new sap.ui.model.Filter({
                        filters: [aRegisteredUserID, aRegisteredMobile],
                        and: true // Change to false if you want OR logic
                    });

                    const oResponse = await this.readData(oModel, sPath, aFilters)
                    if (oResponse.results.length > 0) {
                        const sRegisteredUserID = oResponse.results[0].userID,
                            sRegisteredPhnNumber = oResponse.results[0].phoneNo,
                            sStoredPassword = oResponse.results[0].password,
                            sUUID = oResponse.results[0].ID;

                        if (sRegisteredUserID === sUserEnteredUserID && sRegisteredPhnNumber === sUserEnteredMobile) {

                            // get the actual password
                            const sNewPassword = this.getView().byId("InputNewPasswordForgotPassword_cs").getValue();

                            // Use SHA256 for hashing (CryptoJS)
                            const sEncrytpedPass = CryptoJS.SHA256(sNewPassword).toString(); // encryption with CryptoJS
                            if (sStoredPassword === sEncrytpedPass) {
                                sap.m.MessageBox.information("New Password can not be same as previous password");
                                return;
                            }
                            const oPayload = {
                                password: sEncrytpedPass
                            }
                            try {

                                // update call
                                const oResponse = await this.updateData(oModel, oPayload, `${sPath}('${sUUID}')`);
                                sap.m.MessageToast.show("Password Changed Successfully")
                                const oUserView = this.getView();
                                // after successfull  value states
                                oUserView.byId("InputMobNoForgotPassword_cs").setValueState("None");
                                oUserView.byId("UserIdInputForgotPassword_cs").setValueState("None");
                                oUserView.byId("InputNewPasswordForgotPassword_cs").setValueState("None");

                                // clear fields
                                oUserView.byId("InputMobNoForgotPassword_cs").setValue("");
                                oUserView.byId("UserIdInputForgotPassword_cs").setValue("");
                                oUserView.byId("InputNewPasswordForgotPassword_cs").setValue("");
                                // close the fragment
                                this.oForgotPasswordDialog.close();

                            } catch (error) {
                                sap.m.MessageToast.show("Failed to reset password" + error)
                            }
                        } else {
                            sap.m.MessageToast.show("ID and phone number mismatch")
                        }
                    } else {
                        sap.m.MessageToast.show("ID and phone number mismatch")
                    }

                } catch (error) {
                    sap.m.MessageToast.show("Failed to read data " + error)
                }
            },
        });
    });