sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"

], function (Controller, Fragment, Filter, FilterOperator) {
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
        onPressAvatarPopOverBaseFunction: function (oEvent) {
            debugger;
            var This = this;
            const oUserId = This.ID;
            var oView = This.getView();
            var oModel1 = This.getOwnerComponent().getModel("ModelV2");

            oModel1.read(`/Users`, {
                filters: [new Filter("userID", FilterOperator.EQ, oUserId)],
                success: function (results) {
                    // Prepare the profile data
                    var oProfileData = {
                        Name: results.fName,
                        Name1: results.lName,
                        Number: results.Phonenumber
                    };
                    var oProfileModel = new sap.ui.model.json.JSONModel(oProfileData);

                    if (!This._oPopover) {
                        This._oPopover = This.loadFragment("ProfileDialog");
                        oView.addDependent(This._oPopover);
                    }
                    // Set both the profile and visibility models to the popover
                    This._oPopover.setModel(oProfileModel, "profile");
                    // Open the popover near the avatar after the data is set
                    This._oPopover.openBy(oEvent.getSource());
                },
                error: function () {
                    sap.m.MessageToast.show("User does not exist");
                }
            });
        },
        //Account Details press function from popover
        onPressAccountDetails: async function () {
            const oModel1 = this.getOwnerComponent().getModel();
            const userId = this.ID;

            // Fetch user details from the backend
            await new Promise((resolve, reject) => {
                oModel1.read(`/RESOURCESSet('${userId}')`, {
                    success: function (oData) {
                        const userDetails = oData; // Adjust this based on your data structure
                        // Set user data in a new model or update existing model
                        const oUserModel = new sap.ui.model.json.JSONModel(userDetails);
                        this.getView().setModel(oUserModel, "oUserModel"); // Set the model with name
                        resolve();
                    }.bind(this), // Bind this to ensure the context is correct
                    error: function () {
                        MessageToast.show("Error loading user tiles");
                        reject();
                    }
                });
            });

            if (!this.UserDetailsFragment) {
                this.UserDetailsFragment = await this.loadFragment("UserDetails"); // Load your fragment asynchronously
            }
            this.UserDetailsFragment.open();
            this.applyStoredProfileImage();
        },
        onPressDeclineProfileDetailsDailog: function () {
            if (this.UserDetailsFragment) {
                this.UserDetailsFragment.close();
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