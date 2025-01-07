sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",

], function (Controller, Fragment, Filter, FilterOperator, MessageBox, MessageToast) {
    'use strict';

    return Controller.extend("com.app.capacity.controller.BaseController", {
        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },
        onInit: function () {
            
        },
        //Applying the saved prfile picture to frontand avatars from the backend table with based on user id...
        applyStoredProfileImage: async function () {
            debugger
            var oView = this.getView();
            const oUserID = this.ID; // Assuming this.ID holds the user ID
            var oModel = this.getOwnerComponent().getModel("ModelV2");
            try {
                const userData = await new Promise((resolve, reject) => {
                    oModel.read("/Users", {
                        success: resolve,
                        error: reject
                    });
                });
                const user = userData.results.find((user) => user.userID === oUserID);
                const storedImage = user.profileImage;

                // Find all `sap.m.Avatar` controls in the view
                var allAvatars = oView.findElements(true, function (element) {
                    return element.isA("sap.m.Avatar");
                });
                // Apply the stored image to each avatar
                allAvatars.forEach(function (avatar) {
                    avatar.setSrc(storedImage);
                });
                //sap.m.MessageToast.show("Profile image applied successfully.");
            } catch (error) {
                //sap.m.MessageToast.show("Failed to apply profile image.");
                console.error("Error fetching user data:", error);
            }
        },
        createData: function (oModel, oPayload, sPath) {
            return new Promise((resolve, reject) => {
                oModel.create(sPath, oPayload, {
                    refreshAfterChange: true,
                    success: function (oSuccessData) {
                        resolve(oSuccessData);
                    },
                    error: function (oErrorData) {
                        reject(oErrorData)
                    }
                })
            })
        },
        deleteData: function (oModel, sPath) {
            return new Promise((resolve, reject) => {
                oModel.remove(sPath, {
                    success: function (oSuccessData) {
                        resolve(oSuccessData);
                    },
                    error: function (oErrorData) {
                        reject(oErrorData)
                    }
                })
            })
        },
        updateData: function (oModel, oPayload, sPath) {
            return new Promise((resolve, reject) => {
                oModel.update(sPath, oPayload, {
                    success: function (oSuccessData) {
                        resolve(oSuccessData);
                    },
                    error: function (oErrorData) {
                        reject(oErrorData);
                    }
                })
            })
        },
        readData: function (oModel, sPath, oFilter) {
            return new Promise((resolve, reject) => {
                oModel.read(sPath, {
                    filters: [oFilter],
                    success: function (oSuccessData) {
                        resolve(oSuccessData)
                    }, error: function (oErrorData) {
                        reject(oErrorData)
                    }

                })
            })
        },
        loadFragment: async function (sFragmentName) {
            const oFragment = await Fragment.load({
                id: this.getView().getId(),
                name: `com.app.capacity.fragment.${sFragmentName}`,
                controller: this
            });
            this.getView().addDependent(oFragment);
            return oFragment
        },

        validateField: function (oView, fieldId, value, regex, errorMessage) {
            const validationErrors = [];
            if (!fieldId) {
                if (!value || (regex && !regex.test(value))) {
                    validationErrors.push(errorMessage);
                }
                return validationErrors
            } else {
                // Validation
                const oField = oView.byId(fieldId);
                if (!value || (regex && !regex.test(value))) {
                    oField.setValueState("Error");
                    oField.setValueStateText(errorMessage);
                    validationErrors.push(errorMessage);
                } else {
                    oField.setValueState("None");
                }
                return validationErrors
            }

        },

        //Base function for opening the Profile PopOver..
        loadFragment: async function (sFragmentName) {
            const oFragment = await Fragment.load({
                id: this.getView().getId(),
                name: `com.app.capacity.fragment.${sFragmentName}`,
                controller: this,
            });
            this.getView().addDependent(oFragment);
            return oFragment;
        },


        //Base function for opening the Profile PopOver..
        onPressAvatarPopOverBaseFunction: async function (oEvent) {
            var This = this;
            const oUserId = This.ID;
            var oView = This.getView();
            const oModel1 = this.getOwnerComponent().getModel("ModelV2");

            try {
                const data = await new Promise((resolve, reject) => {
                    oModel1.read("/Users", {
                        success: resolve,
                        error: reject,
                    });
                });

                const user = data.results.find((user) => user.userID === oUserId);
                const oProfileModel = new sap.ui.model.json.JSONModel({
                    Name: `${user.fName} ${user.lName}`,
                    Number: user.phoneNo,
                });

                if (!this.oPopoverUserDetailsFragment) {
                    this.oPopoverUserDetailsFragment = await this.loadFragment("ProfileDialog");
                }

                this.oPopoverUserDetailsFragment.setModel(oProfileModel, "profile");
                this.oPopoverUserDetailsFragment.openBy(oEvent.getSource());
            } catch (error) {
                sap.m.MessageToast.show("Error fetching user data");
                console.error("Error while opening the popover:", error);
            }
        },
        //Account Details press function from popover
        onPressAccountDetails_CM: async function () {
            debugger
            const oUserId = this.ID;
            const oModel1 = this.getOwnerComponent().getModel("ModelV2");

            try {
                const oUserdata = await new Promise((resolve, reject) => {
                    oModel1.read("/Users", {
                        success: resolve,
                        error: reject,
                    });
                });

                const user = oUserdata.results.find((user) => user.userID === oUserId);
                const oProfileModel = new sap.ui.model.json.JSONModel({
                    oUserID: user.userID,
                    fName: user.fName,
                    lName: user.lName,
                    Number: user.phoneNo,
                    UserMail: user.mailID
                });


                // Load the fragment asynchronously if not already loaded
                if (!this.oUserDetailsFragment) {
                    this.oUserDetailsFragment = await this.loadFragment("UserDetails");
                }

                // Set the model to the fragment
                this.oUserDetailsFragment.setModel(oProfileModel, "oUserModel");
                this.oUserDetailsFragment.open();
            } catch (error) {
                sap.m.MessageToast.show("Error fetching user data");
                console.error("Error while opening the popover:", error);
            }
        },
        //Close the Account Details Dailog Box...
        onPressDeclineProfileDetailsDailog_CM: function () {
            if (this.oUserDetailsFragment) {
                this.oUserDetailsFragment.close();
            }
            this.onPressCancelProfileDetails_CMPage();
        },
        //Hover Effect btn function(from Popover)...
        onPressPopoverProfileImageAvatar_CM: function () {
            debugger
            var This = this;
            const oModel1 = This.getOwnerComponent().getModel();
            const oUserID = This.ID;
            var fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.style.display = "none";
            // Add event listener to handle the file selection
            fileInput.addEventListener("change", async (event) => {
                var selectedFile = event.target.files[0];
                if (selectedFile) {
                    try {
                        // Convert image file to a URL
                        const imageUrl = await This.convertImageToURL(selectedFile);
                        // Update all avatar images with the new image URL
                        This.updateAllAvatarImages(imageUrl);
                        const oPayload = { profileImage: imageUrl };
                        // Retrieve user data and find the userpath by ID
                        const oUserdata = await new Promise((resolve, reject) => {
                            oModel1.read("/Users", {
                                success: resolve,
                                error: reject,
                            });
                        });
                        const user = oUserdata.results.find((user) => user.userID === oUserID);
                        const oUserPath = user.ID;
                        // Update the user's profile image URL in the backend
                        await new Promise((resolve, reject) => {
                            oModel1.update(`/Users('${oUserPath}')`, oPayload, {
                                success: resolve,
                                error: reject,
                            });
                        });
                        sap.m.MessageToast.show("Profile image updated successfully.");
                    } catch (oError) {
                        sap.m.MessageToast.show("Failed to update the profile image.");
                    }
                } else {
                    sap.m.MessageToast.show("No image selected.");
                }
            });
            fileInput.click();
        },
        convertImageToURL: async function (file) {
            return new Promise((resolve, reject) => {
                try {
                    const fileReader = new FileReader();
                    // Convert to a Blob URL
                    fileReader.onload = (e) => {
                        const blob = new Blob([e.target.result], { type: file.type });
                        const imageUrl = URL.createObjectURL(blob); // Generate a Blob URL
                        resolve(imageUrl);
                    };
                    fileReader.onerror = reject;
                    fileReader.readAsArrayBuffer(file); // Read file as ArrayBuffer
                } catch (error) {
                    reject(error);
                }
            });
        },
        //Upload btn from the dailog..
        onPressUploadProfilePic_CMPage: async function () {
            debugger
            var This = this;
            const oModel = This.getOwnerComponent().getModel();
            const oUserID = This.ID;
            var fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.style.display = "none";
            // Add event listener to handle the file selection
            fileInput.addEventListener("change", async (event) => {
                var selectedFile = event.target.files[0];
                if (selectedFile) {
                    var reader = new FileReader();
                    // Set up the onload event for FileReader
                    reader.onload = async (e) => {
                        var selectedImageBase64 = e.target.result; // Get the base64 encoded image
                        //localStorage.removeItem("userProfileImage");
                        // Update all avatar images with the new base64 image
                        This.updateAllAvatarImages(selectedImageBase64);
                        //localStorage.setItem("userProfileImage", selectedImageBase64);
                        const cleanBase64 = selectedImageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                        const oPayload = {
                            Profileimage: cleanBase64
                        };
                        await new Promise((resolve, reject) => {
                            oModel.update(`/RESOURCESSet('${userId}')`, oPayload, {
                                success: resolve,
                                error: reject
                            });
                        });
                        sap.m.MessageToast.show("Profile image updated successfully.");
                    };
                    // Read the selected file as a Data URL (base64 string)
                    reader.readAsDataURL(selectedFile);
                } else {
                    sap.m.MessageToast.show("Please select an image to upload.");
                }
            });
            fileInput.click();
        },
        updateAllAvatarImages: function (imageBase64) {
            var This = this;
            var oView = This.getView();
            // Find all avatar controls by checking if they are instances of sap.m.Avatar
            var allAvatarImages = oView.findElements(true, function (element) {
                return element.isA("sap.m.Avatar");
            });
            // Loop through all found avatar controls and update their image source
            allAvatarImages.forEach(function (avatarControl) {
                avatarControl.setSrc(imageBase64);
            });
            //window.location.reload();
        },
        //Deleting the Profile Images...
        onPressDeleteProfilePic: async function () {
            const This = this;
            const oModel = This.getOwnerComponent().getModel();
            const userId = This.ID;
            try {
                sap.ui.core.BusyIndicator.show(0);
                const sEntityPath = `/RESOURCESSet('${userId}')`;
                const userData = await new Promise((resolve, reject) => {
                    oModel.read(sEntityPath, {
                        success: (oData) => resolve(oData),
                        error: (oError) => reject(oError)
                    });
                });
                if (userData.Profileimage) {
                    const oPayload = {
                        Profileimage: "" // Clear the field in the backend
                    };
                    await new Promise((resolve, reject) => {
                        oModel.update(sEntityPath, oPayload, {
                            success: resolve,
                            error: reject
                        });
                    });
                    // Clear the image from UI and local storage
                    This.clearAllAvatarImages();
                    //localStorage.removeItem("userProfileImage");
                    sap.m.MessageToast.show("Profile image removed successfully!");
                } else {
                    sap.m.MessageToast.show("No profile image found to delete.");
                }
            } catch (oError) {
                console.error("Error deleting profile image:", oError);
            } finally {
                sap.ui.core.BusyIndicator.hide();
            }
        },
        clearAllAvatarImages: function () {
            var This = this;
            var oView = This.getView();
            var allAvatarImagesRemoving = oView.findElements(true, function (element) {
                return element.isA("sap.m.Avatar");
            });
            // Loop through all found avatar controls and update their image source
            allAvatarImagesRemoving.forEach(function (avatarControl) {
                avatarControl.setSrc("");
            });
            window.location.reload();
        },
        //Edit Btn for Profile details changing...
        onPressEditProfileDetails_CMPage: function () {
            this.pastFirstName = this.byId("idInputTextResourceFirstname_CMPage").getText();
            this.pastlLastName = this.byId("idInputTextResourceLastname_CMPage").getText();
            this.pastPhonenumber = this.byId("idInputTextUserPhonenumber_CMPage").getText();

            // Hide view-only fields and show editable input fields
            this.byId("idInputTextResourceFirstname_CMPage").setVisible(false);
            this.byId("idInputTextResourceLastname_CMPage").setVisible(false);
            this.byId("idInputTextUserPhonenumber_CMPage").setVisible(false);

            this.byId("idFrontandInputFirstName_CMPage").setVisible(true).setValue(this.pastFirstName);
            this.byId("idFrontandInputLastName_CMPage").setVisible(true).setValue(this.pastlLastName);
            this.byId("idFrontandInputPhoneNumber_CMPage").setVisible(true).setValue(this.pastPhonenumber);

            // Toggle button visibility
            this.byId("idBtnUploadImageforProfile_CMPage").setVisible(false);
            this.byId("idBtnDeleteImageforProfile_CMPage").setVisible(false);
            this.byId("idBtnEditDetailsforProfile_CMPage").setVisible(false);
            this.byId("idBtnSaveProfileDetails_CMPage").setVisible(true);
            this.byId("idBtnCancelProfileDetails_CMPage").setVisible(true);
        },
        onPressSaveProfileDetails_CMPage: async function () {
            debugger
            var oUserID = this.ID; // Assuming this is defined as the user ID for the current session
            var oModel = this.getOwnerComponent().getModel();

            // Get the input values
            var sFName = this.byId("idFrontandInputFirstName_CMPage").getValue();
            var sLName = this.byId("idFrontandInputLastName_CMPage").getValue();
            var sPhone = this.byId("idFrontandInputPhoneNumber_CMPage").getValue();

            var bValid = true;

            // Check for empty or too-short values in Name field
            if (!sFName || sFName.length < 3) {
                this.byId("idFrontandInputFirstName_CMPage").setValueState(sap.ui.core.ValueState.Error);
                this.byId("idFrontandInputFirstName_CMPage").setValueStateText(sFName ? "Firstname should be at least 3 letters!" : "Firstname is required!");
                bValid = false;
            } else {
                this.byId("idFrontandInputFirstName_CMPage").setValueState(sap.ui.core.ValueState.None);
            }

            if (!sLName || sLName.length < 1) {
                this.byId("idFrontandInputLastName_CMPage").setValueState(sap.ui.core.ValueState.Error);
                this.byId("idFrontandInputLastName_CMPage").setValueStateText(sLName ? "Lastname should be at least 1 letters!" : "Lastname is required!");
                bValid = false;
            } else {
                this.byId("idFrontandInputLastName_CMPage").setValueState(sap.ui.core.ValueState.None);
            }

            // Check for empty or too-short values in Phone field
            var phoneRegex = /^\d{10}$/;
            if (!sPhone || sPhone.length < 3 || !phoneRegex.test(sPhone)) {
                this.byId("idFrontandInputPhoneNumber_CMPage").setValueState(sap.ui.core.ValueState.Error);
                this.byId("idFrontandInputPhoneNumber_CMPage").setValueStateText(sPhone ? "Phone number should be 10 digits!" : "Phone number is required!");
                bValid = false;
            } else {
                this.byId("idFrontandInputPhoneNumber_CMPage").setValueState(sap.ui.core.ValueState.None);
            }

            // If any field is invalid, show an error message and return
            if (!bValid) {
                sap.m.MessageBox.error("Please correct the highlighted errors.");
                return;
            }
            // Retrieve all resources for validation
            try {
                sap.ui.core.BusyIndicator.show(0);
                const oUserdata = await new Promise((resolve, reject) => {
                    oModel.read("/Users", {
                        success: resolve,
                        error: reject,
                    });
                });
                const user = oUserdata.results.find((user) => user.userID === oUserID);
                const oUserPath = user.ID;

                // Check if the phone number has been changed
                if (user.phoneNo !== sPhone) {
                    const existingResources = await new Promise((resolve, reject) => {
                        oModel.read(`/Users`, {
                            success: (oData) => resolve(oData.results),
                            error: (oError) => reject(oError)
                        });
                    });

                    // Check if the new phone number is already used by another resource
                    if (existingResources.some(resource => resource.phoneNo === sPhone && resource.ID !== oUserID)) {
                        sap.m.MessageBox.error("Phone number is already used. Please enter a different phone number.");
                        return;
                    }
                }

                // Proceed with updating the resource details
                var sEntityPath = `/Users('${oUserPath}')`;
                var oPayload = {
                    fName: sFName,
                    lName: sLName,
                    phoneNo: sPhone,
                };

                await new Promise((resolve, reject) => {
                    oModel.update(sEntityPath, oPayload, {
                        success: resolve,
                        error: reject
                    });
                });

                sap.m.MessageToast.show("Profile updated successfully!");

                // Hide buttons and show text fields
                this.byId("idBtnSaveProfileDetails_CMPage").setVisible(false);
                this.byId("idBtnCancelProfileDetails_CMPage").setVisible(false);
                this.byId("idBtnEditDetailsforProfile_CMPage").setVisible(true);
                this.byId("idBtnUploadImageforProfile_CMPage").setVisible(true);
                this.byId("idBtnDeleteImageforProfile_CMPage").setVisible(true);

                this.byId("idFrontandInputFirstName_CMPage").setVisible(false);
                this.byId("idFrontandInputLastName_CMPage").setVisible(false);
                this.byId("idFrontandInputPhoneNumber_CMPage").setVisible(false);

                this.byId("idInputTextResourceFirstname_CMPage").setVisible(true);
                this.byId("idInputTextResourceLastname_CMPage").setVisible(true);
                this.byId("idInputTextUserPhonenumber_CMPage").setVisible(true);
            } catch (error) {
                sap.m.MessageToast.show("Error updating profile or fetching data.");
            } finally {
                sap.ui.core.BusyIndicator.hide();
            }
        },
        //Cancel the Profile Details Changing...
        onPressCancelProfileDetails_CMPage: function () {
            this.byId("idInputTextResourceFirstname_CMPage").setText(this.pastFirstName).setVisible(true);
            this.byId("idInputTextResourceLastname_CMPage").setText(this.pastlLastName).setVisible(true);
            this.byId("idInputTextUserPhonenumber_CMPage").setText(this.pastPhonenumber).setVisible(true);
            
            // Hide editable input fields
            this.byId("idFrontandInputFirstName_CMPage").setVisible(false);
            this.byId("idFrontandInputLastName_CMPage").setVisible(false);
            this.byId("idFrontandInputPhoneNumber_CMPage").setVisible(false);

            // Restore button visibility
            this.byId("idBtnUploadImageforProfile_CMPage").setVisible(true);
            this.byId("idBtnDeleteImageforProfile_CMPage").setVisible(true);
            this.byId("idBtnEditDetailsforProfile_CMPage").setVisible(true);
            this.byId("idBtnSaveProfileDetails_CMPage").setVisible(false);
            this.byId("idBtnCancelProfileDetails_CMPage").setVisible(false);
        },

    })

});