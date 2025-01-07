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
            // Apply the stored profile image to all avatars in the app
            this.applyStoredProfileImage();
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
        deleteData: function (oModel, sPath, sBatchID) {
            return new Promise((resolve, reject) => {
                oModel.remove(sPath, {
                    groupId: sBatchID,
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
        onPressDeclineProfileDetailsDailog_CM: function () {
            if (this.oUserDetailsFragment) {
                this.oUserDetailsFragment.close();
            }
        },
        //Hover Effect btn function(from Popover)...
        onPressPopoverProfileImageAvatar: function () {
            var This = this;
            var fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.style.display = "none";

            // Add event listener to handle the file selection
            fileInput.addEventListener("change", (event) => {
                var selectedFile = event.target.files[0];
                if (selectedFile) {
                    var reader = new FileReader();
                    // Set up the onload event for FileReader
                    reader.onload = (e) => {
                        var selectedImageBase64 = e.target.result; // Get the base64 encoded image

                        // Clear the previous image from localStorage
                        localStorage.removeItem("userProfileImage");

                        // Update all avatar images with the new base64 image
                        This.updateAllAvatarImages(selectedImageBase64);

                        // Store the new image in localStorage
                        localStorage.setItem("userProfileImage", selectedImageBase64);
                        sap.m.MessageToast.show("Profile image updated successfully!");
                    };
                    // Read the selected file as a Data URL (base64 string)
                    reader.readAsDataURL(selectedFile);
                } else {
                    sap.m.MessageToast.show("Please select an image to upload.");
                }
            });
            fileInput.click();
        },
        //Upload btn from the dailog..
        onPressUploadProfilePic: function () {
            var This = this;
            var fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.style.display = "none";

            // Add event listener to handle the file selection
            fileInput.addEventListener("change", (event) => {
                var selectedFile = event.target.files[0];
                if (selectedFile) {
                    var reader = new FileReader();
                    // Set up the onload event for FileReader
                    reader.onload = (e) => {
                        var selectedImageBase64 = e.target.result; // Get the base64 encoded image
                        localStorage.removeItem("userProfileImage");

                        // Update all avatar images with the new base64 image
                        This.updateAllAvatarImages(selectedImageBase64);

                        // Store the new image in localStorage
                        localStorage.setItem("userProfileImage", selectedImageBase64);
                        sap.m.MessageToast.show("Profile image updated successfully!");
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
        },
        //Deleting the Profile Images...
        onPressDeleteProfilePic: function () {
            this.clearAllAvatarImages();
            localStorage.removeItem("userProfileImage");
            sap.m.MessageToast.show("Profile image removed successfully!");
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
        }

    })

});