sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel"
],
  function (BaseController, MessageBox, MessageToast, JSONModel) {
    "use strict";

    return BaseController.extend("com.app.capacity.controller.MainPage", {
      onInit() {

        /**Combined Model for Model and Containers */
        const oCombinedModel = new JSONModel({
          Product:
          {
            ID: "",
            model: "",
            EAN: "",
            length: "",
            width: "",
            height: "",
            volume: "",
            vuom: "",
            muom: "",
            uom: "",
            mCategory: "",
            description: "",
            netWeight: "",
            grossWeight: "",
            wuom: "",
            quantity: "",
            stack: "",
            bearingCapacity: "",
          },
          Vehicle: {
            truckType: "",
            length: "",
            width: "",
            height: "",
            uom: "",
            tvuom: "M³",
            tuom: "M",
            volume: "",
            truckWeight: "",
            capacity: "",
          }
        })
        // Set the combined model to the view
        this.getView().setModel(oCombinedModel, "CombinedModel")

        // Material upload
        this.MaterialModel = new JSONModel();
        this.getView().setModel(this.MaterialModel, "MaterialModel");

        /**Combined Model for Model and Containers */
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.attachRoutePatternMatched(this.onUserDetailsLoadCapacityManagement, this);
      },
      onUserDetailsLoadCapacityManagement: async function (oEvent1) {
        debugger
        const { id } = oEvent1.getParameter("arguments");
        this.ID = id;
      },

      //Avatar Press function from the MainPage_CM
      onAvatarPress_CapacityManagement: function (oEvent) {
        var oComponent = this.getOwnerComponent();
        // Destroy the existing popover if it exists
        if (oComponent.getPopover()) {
          oComponent.getPopover().destroy();
          oComponent.setPopover(null);
        }

        // Call the reusable function from BaseController
        this.onPressAvatarPopOverBaseFunction(oEvent);
      },

      /*For ToolMenuCollapse */
      onCollapseExpandPress() {
        const oSideNavigation = this.byId("idSidenavigation"),
          bExpanded = oSideNavigation.getExpanded();
        oSideNavigation.setExpanded(!bExpanded);
      },

      /**changing the view based on selection */
      onItemSelect: function (oEvent) {

        var itemKey = oEvent.getParameter("item").getKey();
        var navContainer = this.getView().byId("idNavContainer");

        const navigationMap = {
          "MasterRecords": "idScrollConForMasterDetails",
          "SimulationCreation": "idScollContainerForSimulation"
        };

        // Get the target ID from the navigation map
        const targetId = navigationMap[itemKey];
        // Navigate to the corresponding page based on the selected key
        if (targetId) {
          navContainer.to(this.getView().createId(targetId));
        }
      },
      /**Container Fragment open for Creation */
      onContainerCreate: async function () {
        let oSelectedItem = this.byId("idContianersTable").getSelectedItems();
        if (oSelectedItem.length > 0) {
          return MessageBox.warning("Please Unselect the Row For Creation");
        }
        if (!this.oContainerCreate) {
          this.oContainerCreate = await this.loadFragment("CreateContainer");
        }
        this.oContainerCreate.open();
      },
      /**Closing Container Fragment */
      onCancelCreateContainer: function () {
        if (this.oContainerCreate.isOpen()) {
          this.oContainerCreate.close();
        }

      },
      /**Create Product/Model */
      onCreateProduct: async function () {
        const oView = this.getView(),
          oCombinedModel = oView.getModel("CombinedModel"),
          oProductPayload = oCombinedModel.getProperty("/Product"),
          oModel = oView.getModel("ModelV2"),
          oPath = "/Materials";
        let raisedErrors = [];
        const aUserInputs = [
          // { Id: "idDesvbncriptionInput_InitialView", value: oProductPayload.EAN, regex: null, message: "Please enter EAN" },
          { Id: "idInputForModelNum", value: oProductPayload.model, regex: null, message: "Enter SAP product number" },
          { Id: "idInputForModelLeng", value: oProductPayload.length, regex: /^\d+(\.\d+)?$/, message: "Length should be numeric" },
          { Id: "idInputForModelWidth", value: oProductPayload.width, regex: /^\d+(\.\d+)?$/, message: "Width should be numeric" },
          { Id: "idInputForModelHeight", value: oProductPayload.height, regex: /^\d+(\.\d+)?$/, message: "Height should be numeric" },
          { Id: "idInputForModelCat", value: oProductPayload.mCategory, regex: null, message: "Enter category" },
          { Id: "idInputForModelDesc", value: oProductPayload.description, regex: null, message: "Enter description" },
          { Id: "idInputForModelNetWeight", value: oProductPayload.netWeight, regex: /^\d+(\.\d+)?$/, message: "Net Weight should be numeric" },
          { Id: "idInputForModelGrossWeight", value: oProductPayload.grossWeight, regex: /^\d+(\.\d+)?$/, message: "Gross Weight should be numeric" },
          { Id: "idInputForModelQuan", value: oProductPayload.quantity, regex: /^\d+$/, message: "Quantity should be numeric" },
          { Id: "idInputForModelStack", value: oProductPayload.stack, regex: /^\d+$/, message: "Stack should be numeric" }]
        // Create an array of promises for validation
        const validationPromises = aUserInputs.map(async input => {
          let aValidations = await this.validateField(oView, input.Id, input.value, input.regex, input.message);
          if (aValidations.length > 0) {
            raisedErrors.push(aValidations[0]); // Push first error into array
          }
        });

        // Wait for all validations to complete
        await Promise.all(validationPromises);

        // Check if there are any raised errors
        if (raisedErrors.length > 0) {
          // Consolidate errors into a single message
          const errorMessage = raisedErrors.join("\n");
          MessageBox.information(errorMessage); // Show consolidated error messages
          return;
        }
        /**Checking L*W*H UOM */
        let oSlectedLWHUOM = this.byId("idForSelectModelLWHUOM").getSelectedKey();
        if (oSlectedLWHUOM === 'Select') {
          return MessageBox.warning("Please Select L*W*H UOM!!");
        }
        oProductPayload.uom = oSlectedLWHUOM;
        /**Checking Net and Gross Weight UOM */
        let oSlectedNWUOM = this.byId("idSelectModelWeightUOM").getSelectedKey();
        if (oSlectedNWUOM === 'Select') {
          return MessageBox.warning("Please Select Net&Gross Weight UOM!!");
        }
        oProductPayload.wuom = oSlectedNWUOM;

        let oVolume;
        const conversionFactors = {
          'CM': 0.01,  // Convert cm to meters
          'mm': 0.001, // Convert mm to meters
          'M': 1       // No conversion needed for meters
        };
        oProductPayload.bearingCapacity = String(oProductPayload.stack * oProductPayload.grossWeight);
        // Determine the conversion factor based on UOM
        const factor = conversionFactors[oProductPayload.uom] || 1; // Default to 1 if UOM is not found

        // Calculate volume in cubic meters
        oVolume = (oProductPayload.length * factor) * (oProductPayload.width * factor) * (oProductPayload.height * factor);

        // Store the volume in the payload with 7 decimal places
        oProductPayload.volume = String(oVolume.toFixed(7)); // Volume in cubic meters with 7 decimal places
        oProductPayload.muom = 'PC';
        oProductPayload.vuom = "M³";
        try {
          await this.createData(oModel, oProductPayload, oPath);
          this.getView().byId("idModelsTable").getBinding("items").refresh();
          this.byId("idForSelectModelLWHUOM").setSelectedKey("");
          this.byId("idSelectModelWeightUOM").setSelectedKey("");
          MessageToast.show("Successfully Created!");
          oCombinedModel.setProperty("/Product", {}) // clear data after successful creation
          // this.ClearingModel(true);
          MessageToast.show("Successfully Created!");
        } catch (error) {
          console.error(error);
          if (error.statusCode === "400" && JSON.parse(error.responseText).error.message.value.toLowerCase() === "entity already exists") {
            MessageBox.information("Product Number Should be unique enter different value")
          } else {
            MessageToast.show("Facing technical issue");
          }
        }

      },
      /** Deleting Models */
      onModelDelete: async function () {
        let oSlectedItems = this.byId("idModelsTable").getSelectedItems();
        const oModel = this.getView().getModel("ModelV2");
        if (oSlectedItems.length < 1) {
          return MessageBox.warning("Please Select atleast One Model/Prodcut");
        }
        try {
          for (let Item of oSlectedItems) {
            let sPath = Item.getBindingContext().getPath();
            await this.deleteData(oModel, sPath);
          }
          this.byId("idModelsTable").getBinding("items").refresh();
          MessageToast.show("successfully Deleted")
        } catch {
          MessageBox.error("Error Occurs!");
        }
      },
      /**Truck type selection based on click display details */
      onTruckTypeChange: function (oEvent) {
        let oSelectedItem = oEvent.getParameter('listItem'),
          oContext = oSelectedItem.getBindingContext();
      },
      onContainerDelete: async function () {
        let oSlectedItems = this.byId("idContianersTable").getSelectedItems();
        const oModel = this.getView().getModel("ModelV2");
        if (oSlectedItems.length < 1) {
          return MessageBox.warning("Please Select atleast One Container");
        }
        try {
          for (let Item of oSlectedItems) {
            let sPath = Item.getBindingContext().getPath();
            await this.deleteData(oModel, sPath);
          }
          this.byId("idContianersTable").getBinding("items").refresh();
          MessageToast.show("successfully Deleted")
        } catch {
          MessageBox.error("Error Occurs!");
        }
      },
      //edit product functinality

      onPressEditInProductsTable:async  function() {
        var oSelectedItem = this.byId("idModelsTable").getSelectedItems();
        if (!oSelectedItem) {
          MessageBox.information("Please select at least one Row for edit!");
          return;
        }
        if(oSelectedItem.length > 1){
          MessageBox.information("Please select only one Row for edit!");
          return;
        }
       let oPayload = oSelectedItem[0].getBindingContext().getObject();
       this.getView().getModel("CombinedModel").setProperty("/Product",oPayload)
          if (!this.oEdit) {
            this.oEdit = await this.loadFragment("EditproductDetails");
             }
        this.oEdit.open();

  
        },
        onCancelInEditProductDialog: function () {
        if (this.oEdit.isOpen()) {
            this.oEdit.close();
        }
      },

      onSaveProduct : async function() {
        // Get the edited data from the fragment model
        var oModel = this.getView().getModel("CombinedModel");
        var oUpdatedProduct = oModel.getProperty("/Product");
    
        // Get the original product row binding context (from the selected row in the table)
        var oTable = this.byId("idModelsTable");
        var oSelectedItem = oTable.getSelectedItem();
        var oContext = oSelectedItem.getBindingContext();
    
        // Use the context to get the path and ID of the selected product for updating
        var sPath = oContext.getPath(); // The path to the product entry in the OData model

      //   if (oUpdatedProduct.length <= 0 || isNaN(oUpdatedProduct.length)) {
      //     MessageBox.error("Please enter a valid positive number for Length!");
      //     return;
      // }
      // if (oUpdatedProduct.width <= 0 || isNaN(oUpdatedProduct.width)) {
      //     MessageBox.error("Please enter a valid positive number for Width!");
      //     return;
      // }
      // if (oUpdatedProduct.height <= 0 || isNaN(oUpdatedProduct.height)) {
      //     MessageBox.error("Please enter a valid positive number for Height!");
      //     return;
      // }
        
        // Create the payload for updating the product in the backend
        var oPayloadmodelupdate = {
            description: oUpdatedProduct.description,
            grossWeight:oUpdatedProduct.grossWeight,
            netWeight: oUpdatedProduct.netWeight,
            length: oUpdatedProduct.length,
            width: oUpdatedProduct.width,
            wuom: oUpdatedProduct.wuom,
            height: oUpdatedProduct.height,
            uom: oUpdatedProduct.uom,
            quantity: oUpdatedProduct.quantity,
            stack: oUpdatedProduct.stack
        }; 
        const oView = this.getView();
        let raisedErrorsSave = [];
        const aUserInputsSave = [
          // { Id: "idDesvbncriptionInput_InitialView", value: oProductPayload.EAN, regex: null, message: "Please enter EAN" },
          { Id: "editProductNoInput", value: oPayloadmodelupdate.model, regex: null, message: "Enter SAP product number" },
          { Id: "editproLengthInput", value: oPayloadmodelupdate.length, regex: /^\d+(\.\d+)?$/, message: "Length should be numeric" },
          { Id: "editprodWidthInput", value: oPayloadmodelupdate.width, regex: /^\d+(\.\d+)?$/, message: "Width should be numeric" },
          { Id: "editprodHeightInput", value: oPayloadmodelupdate.height, regex: /^\d+(\.\d+)?$/, message: "Height should be numeric" },
          // { Id: "idInputForModelCat", value: oPayloadmodelupdate.mCategory, regex: null, message: "Enter category" },
          { Id: "editDescriptionInput", value: oPayloadmodelupdate.description, regex: null, message: "Enter description" },
          { Id: "editnetWeightLabel", value: oPayloadmodelupdate.netWeight, regex: /^\d+(\.\d+)?$/, message: "Net Weight should be numeric" },
          { Id: "editgrossWeightInput", value: oPayloadmodelupdate.grossWeight, regex: /^\d+(\.\d+)?$/, message: "Gross Weight should be numeric" },
          { Id: "editQuantityInput", value: oPayloadmodelupdate.quantity, regex: /^\d+$/, message: "Quantity should be numeric" },
          { Id: "editstackInput", value: oPayloadmodelupdate.stack, regex: /^\d+$/, message: "Stack should be numeric" }]
        // Create an array of promises for validation

        const validationPromisesSave = aUserInputsSave.map(async input => {
          let aValidationsSave = await this.validateField(oView, input.Id, input.value, input.regex, input.message);
          if (aValidationsSave.length > 0) {
            raisedErrorsSave.push(aValidationsSave[0]); // Push first error into array
          }
        });

        // Wait for all validations to complete
        await Promise.all(validationPromisesSave);

        // Check if there are any raised errors
        if (raisedErrorsSave.length > 0) {
          // Consolidate errors into a single message
          const errorMessageSave = raisedErrorsSave.join("\n");
          MessageBox.information(errorMessageSave); // Show consolidated error messages
          return;
        }
    
        try {
            // Call the OData update request to save the edited data in the backend
            await this.getView().getModel().update(sPath, oPayloadmodelupdate, {
                success: function() {
                    // If the update is successful, show a success message
                    MessageBox.success("Product details updated successfully!");
    
                    // Close the fragment
                    this.oEdit.close();
    
                    // Optionally, refresh the table binding to reflect the changes
                    oTable.getBinding("items").refresh();
                }.bind(this),
                error: function(oError) {
                    // Handle the error scenario (e.g., show error message)
                    MessageBox.error("Error updating product details: " + oError.message);
                }
            });
        } catch (error) {
            MessageBox.error("Error updating product details: " + error.message);
        }
    }
    });
  });
