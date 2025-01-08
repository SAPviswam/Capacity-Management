const { getArtifactCdsPersistenceName } = require("@sap/cds/lib/compile/cdsc");

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
        
        // Material upload
        this.MaterialModel = new JSONModel();
        this.getView().setModel(this.MaterialModel, "MaterialModel");


        // Container upload
        this.ContainerModel = new JSONModel();
        this.getView().setModel(this.ContainerModel, "ContainerModel");


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
            tuom: "KG",
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
        // Apply the stored profile image to all avatars in the app
        this.applyStoredProfileImage();
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
      /**Fragment's open and Close logics */
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
          this.oContainerCreate.destroy();

        }
        this.getView().getModel("CombinedModel").setProperty("/Vehicle", {});
      },
      /**Opening ModelEdit Fragment */
      onModelEditFragment: async function () {
        if (!this.oEdit) {
          this.oEdit = await this.loadFragment("EditproductDetails");
        }
        this.oEdit.open();
      },
      /**closing Edit Model Fragment */
      onCloseEditModel: function () {
        if (this.oEdit.isOpen()) {
          this.oEdit.close();
        }
        this.getView().getModel("CombinedModel").setProperty("/Product", {});

      },
      /**Open Container Edit */
      onOpenContainerEdit: async function () {
        if (!this.oEditContainer) {
          this.oEditContainer = await this.loadFragment("EditContainerDetails");

        }
        this.oEditContainer.open();
      },
      /**closing Editing Container */
      onCancelEditContainer: function () {
        if (this.oEditContainer.isOpen()) {
          this.oEditContainer.close();
          this.getView().getModel("CombinedModel").setProperty("/Vehicle", {});
        }
      },
/**Opening Container Batch Fragment */
onOpenContainerBranch:async function(){
  // Open the fragment and import data if a file is selected
  if (!this.oFragmentContainer) {
    this.oFragmentContainer = await this.loadFragment("ContainerXlData");
  }
  this.oFragmentContainer.open();
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
        if (oSlectedItems.length < 1) {
          return MessageBox.warning("Please Select atleast One Model/Prodcut");
        }

        this._oBusyDialog = new sap.m.BusyDialog({
          text: "Deleting Data"
        });
        this._oBusyDialog.open()

        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const oModel = this.getView().getModel("ModelV2");
          // Create a batch group ID to group the delete requests
          var sBatchGroupId = "deleteBatchGroup";
          // Start a batch operation
          oModel.setUseBatch(true);
          oModel.setDeferredGroups([sBatchGroupId]);
          oSlectedItems.forEach(async (item) => {
            let sPath = item.getBindingContext().getPath();
            await this.deleteData(oModel, sPath, sBatchGroupId);

          })
          // Submit the batch request
          oModel.submitChanges({
            groupId: sBatchGroupId,
            success: this._onBatchSuccess.bind(this),
            error: this._onBatchError.bind(this),
            refresh: this.byId("idModelsTable").getBinding("items").refresh()
          });

        } catch (error) {
          MessageBox.error("Technical deletion error");
        } finally {
          this._oBusyDialog.close()
        }
      },

      // Success callback after the batch request
      _onBatchSuccess: function (oData) {
        MessageToast.show("successfully Deleted");
      },

      // Error callback after the batch request
      _onBatchError: function (oError) {
        MessageToast.show("Batch delete failed. Please try again.");
      },
      //test  
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

      /*edit product functinality*/
      onModelEdit: async function () {

        var oSelectedItem = this.byId("idModelsTable").getSelectedItems();
        if (oSelectedItem.length == 0) {
          MessageBox.information("Please select at least one Row for edit!");
          return;
        }
        if (oSelectedItem.length > 1) {
          MessageBox.information("Please select only one Row for edit!");
          return;
        }
        let oPayload = oSelectedItem[0].getBindingContext().getObject();

        this.getView().getModel("CombinedModel").setProperty("/Product", oPayload)
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

      // onSaveProduct: async function () {
      //   // Get the edited data from the fragment model
      //   var oModel = this.getView().getModel("CombinedModel");
      //   var oUpdatedProduct = oModel.getProperty("/Product");

      //   // Get the original product row binding context (from the selected row in the table)
      //   var oTable = this.byId("idModelsTable");
      //   var oSelectedItem = oTable.getSelectedItem();
      //   var oContext = oSelectedItem.getBindingContext();

      //   // Use the context to get the path and ID of the selected product for updating
      //   var sPath = oContext.getPath(); // The path to the product entry in the OData model

      //   //   if (oUpdatedProduct.length <= 0 || isNaN(oUpdatedProduct.length)) {
      //   //     MessageBox.error("Please enter a valid positive number for Length!");
      //   //     return;
      //   // }
      //   // if (oUpdatedProduct.width <= 0 || isNaN(oUpdatedProduct.width)) {
      //   //     MessageBox.error("Please enter a valid positive number for Width!");
      //   //     return;
      //   // }
      //   // if (oUpdatedProduct.height <= 0 || isNaN(oUpdatedProduct.height)) {
      //   //     MessageBox.error("Please enter a valid positive number for Height!");
      //   //     return;
      //   // }

      //   // Create the payload for updating the product in the backend
      //   var oPayloadmodelupdate = {

      //   this.getView().getModel("CombinedModel").setProperty("/Product", oPayload);
      //   this.onModelEditFragment();
      // },
      /**save After Modifications */
      onSaveProduct: async function () {
        debugger
        // Get the edited data from the fragment model
        const oView = this.getView(),
          oProductModel = oView.getModel("CombinedModel"),
          oUpdatedProduct = oProductModel.getProperty("/Product"),
          // Get the original product row binding context (from the selected row in the table)
          oTable = this.byId("idModelsTable"),
          oSelectedItem = oTable.getSelectedItem(),
          oContext = oSelectedItem.getBindingContext(),
          // Use the context to get the path and ID of the selected product for updating
          sPath = oContext.getPath(), // The path to the product entry in the OData model
          oModel = oView.getModel("ModelV2");

        // Create the payload for updating the product in the backend
        var oPayloadmodelupdate = {
          model: oUpdatedProduct.model,

          description: oUpdatedProduct.description,
          grossWeight: oUpdatedProduct.grossWeight,
          netWeight: oUpdatedProduct.netWeight,
          length: oUpdatedProduct.length,
          width: oUpdatedProduct.width,
          wuom: oUpdatedProduct.wuom,
          height: oUpdatedProduct.height,
          uom: oUpdatedProduct.uom,
          quantity: oUpdatedProduct.quantity,

          //           stack: oUpdatedProduct.stack
          //         };
          //         const oView = this.getView();

          stack: oUpdatedProduct.stack,
          volume: oUpdatedProduct.volume,
        };

        let raisedErrorsSave = [];
        const aUserInputsSave = [
          // { Id: "idDesvbncriptionInput_InitialView", value: oProductPayload.EAN, regex: null, message: "Please enter EAN" },
          { Id: "editProductNoInput", value: oPayloadmodelupdate.model, regex: null, message: "Enter SAP product number" },
          { Id: "editproLengthInput", value: oPayloadmodelupdate.length, regex: /^\d+(\.\d+)?$/, message: "Length should be numeric" },
          { Id: "editprodWidthInput", value: oPayloadmodelupdate.width, regex: /^\d+(\.\d+)?$/, message: "Width should be numeric" },
          { Id: "editprodHeightInput", value: oPayloadmodelupdate.height, regex: /^\d+(\.\d+)?$/, message: "Height should be numeric" },
          // { Id: "idInputForModelCat", value: oPayloadmodelupdate.mCategory, regex: null, message: "Enter category" },
          { Id: "editDescriptionInput", value: oPayloadmodelupdate.description, regex: null, message: "Enter description" },
          { Id: "editnetWeightInput", value: oPayloadmodelupdate.netWeight, regex: /^\d+(\.\d+)?$/, message: "Net Weight should be numeric" },
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


        oPayloadmodelupdate.volume = String((oPayloadmodelupdate.height * oPayloadmodelupdate.width * oPayloadmodelupdate.length).toFixed(2));
        oPayloadmodelupdate.bearingCapacity = String(oPayloadmodelupdate.stack * oPayloadmodelupdate.grossWeight);
        try {
          await this.updateData(oModel, oPayloadmodelupdate, sPath);
          MessageBox.success("Product details updated successfully!");
          // Close the fragment
          this.onCloseEditModel();
          // Optionally, refresh the table binding to reflect the changes
          oTable.getBinding("items").refresh();
        } catch (oError) {
          MessageBox.error("Error updating product details: " + oError.message);
          this.onCloseEditModel()
        }
      },
      onIconTabSelect: function (oEvent) {
        var oSelectedKey = oEvent.getParameter("key");

        // Only open the fragment if the "Create Simulation" tab is selected
        if (oSelectedKey === "createSimulation") {
          this._openCreateSimulationFragment();
        }
      },

      // Open the Create Simulation fragment
      _openCreateSimulationFragment: async function () {
        var oView = this.getView();

        // Check if the fragment is already loaded
        if (!this._oFragment) {
          // Load the fragment if it's not already loaded
          this._oFragment = await this.loadFragment("CreateNewSimulaton")
        }
        this._oFragment.open();
      },

      // Close the fragment (can be attached to a "Close" button in the fragment)
      onCloseDialogSimulate: function () {
        if (this._oFragment) {
          this._oFragment.close();
        }
      },

      // Submit the simulation (for example, a submit button in the fragment)
      onSubmitSimulation: function () {
        var oInput = this.byId("simulationInput");
        var sValue = oInput.getValue();

        if (sValue) {
          MessageToast.show("Simulation Created: " + sValue);
        } else {
          MessageToast.show("Please enter a simulation name.");
        }
      },

/****Material Batch operations fragment open and data setting to that model ---> subash */      
      onMaterialUploadbtn: function () {
        var oFileInput = document.createElement('input');
        oFileInput.type = 'file';
        // Trigger the file input click event to open the file dialog
        oFileInput.click();
        oFileInput.addEventListener('change', this._onFileSelected.bind(this, oFileInput));
      },
      _onFileSelected: async function (oFileInput) {
        // Retrieve the selected file
        var oFile = oFileInput.files[0];
        // test

        // Get the file name and MIME type
        var fileName = oFile.name;

        // Allowed extensions for Excel files
        var allowedExtensions = ['.xls', '.xlsx', '.xlsm'];

        // Check if the file extension is valid
        var fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
          alert("Please select a valid Excel file (.xls, .xlsx, .xlsm)");
          return;
        }
        // test

        if (oFile) {
          // Here, you can implement the logic to handle the file
          // Example of handling the file upload logic.
          if (!this.oFragment) {
            this.oFragment = await this.loadFragment("MaterialXlData");
          }
          this.oFragment.open();
          await this._importData(oFile);
        }
      },
      /**Loading Container Fragment Data */
      _importData: function (file) {
        var that = this;
        var excelData = {};
        if (file && window.FileReader) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, {
              type: 'array'
            });
            workbook.SheetNames.forEach(function (sheetName) {
              // Here is your object for every sheet in workbook
              excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
              // adding serial numbers
              excelData.forEach(function (item, index) {
                item.serialNumber = index + 1; // Serial number starts from 1
              });

            });

            // Setting the data to the local model
            that.MaterialModel.setData({
              items: excelData
            });
            that.MaterialModel.refresh(true);
          };
          reader.onerror = function (ex) {
            console.log(ex);
          };
          reader.readAsArrayBuffer(file);
        }
      },
        /**Creating Models batch */
        onBatchSave: async function () {
          var that = this;
          var addedProdCodeModel = this.getView().getModel("MaterialModel").getData();
          // var batchChanges = [];
          var oDataModel = this.getView().getModel("ModelV2");
          var batchGroupId = "batchCreateGroup";
          const oView = this.getView();
          // test
          // excel Validations
          let raisedErrors = []
          addedProdCodeModel.items.forEach(async (item, index) => {
  
            const aExcelInputs = [
              { value: item.model, regex: null, message: "Enter SAP product number" },
              { value: item.description, regex: null, message: "Enter description" },
              { value: item.mCategory, regex: null, message: "Enter category" },
              { value: item.length, regex: /^\d+(\.\d+)?$/, message: "Length should be numeric" },
              { value: item.width, regex: /^\d+(\.\d+)?$/, message: "Width should be numeric" },
              { value: item.height, regex: /^\d+(\.\d+)?$/, message: "Height should be numeric" },
              { value: item.quantity, regex: /^\d+$/, message: "Quantity should be numeric" },
              { value: item.grossWeight, regex: /^\d+(\.\d+)?$/, message: "Gross Weight should be numeric" },
              { value: item.netWeight, regex: /^\d+(\.\d+)?$/, message: "Net Weight should be numeric" },
              { value: item.wuom, regex: null, message: "Enter UOM for Weight" },
              // { value: item.volume, regex: null, message: "Enter Volume" }
            ]
            for (let input of aExcelInputs) {
              let aValidations = this.validateField(oView, null, input.value, input.regex, input.message)
              if (aValidations.length > 0) {
                raisedErrors.push({ index: index, errorMsg: aValidations[0] }) // pushning error into empty array
              }
            }
          })
  
          if (raisedErrors.length > 0) {
            for (let error of raisedErrors) {
              MessageBox.information(`Check record number ${error.index + 1} ${error.errorMsg}`) // showing error msg 
              return;
            }
          }
          // test
          try {
            addedProdCodeModel.items.forEach(async (item, index) => {
              delete item.serialNumber // deleting serial number
              if (item.uom === "mm" || item.uom === "MM") {
                item.length = String((item.length) / 1000).trim();
                item.width = String((item.width) / 1000).trim();
                item.height = String((item.height) / 1000).trim();
              } else if (item.uom === "cm" || item.uom === "CM") {
                item.length = String((item.length) / 100).trim();
                item.width = String((item.width) / 100).trim();
                item.height = String((item.height) / 100).trim();
              } else {
                item.length = String(item.length).trim();
                item.width = String(item.width).trim();
                item.height = String(item.height).trim();
              }
              item.netWeight = String(item.netWeight).trim();
              item.grossWeight = String(item.grossWeight).trim();
              item.quantity = String(item.quantity).trim();
              item.stack = String(item.stack).trim();
              item.EAN = String(item.EAN).trim();
              item.volume = String(item.length * item.width * item.height)
              // Setting UOM to Meters because we converted to meters
              item.uom = "M"
  
  
              // Create individual batch request 
              await oDataModel.create("/Materials", item, {
                method: "POST",
                groupId: batchGroupId, // Specify the batch group ID here
                success: function (data, response) {
                  if (addedProdCodeModel.items.length === index + 1) {
                    MessageBox.success("Materials created successfully");
                    if (that.oFragment) {
                      that.oFragment.close();
                      that.byId("idModelsTable").getBinding("items").refresh();
                    }
                  }
                },
                error: function (err) {
                  // Handle error for individual item
                  if (JSON.parse(err.responseText).error.message.value.toLowerCase() === "entity already exists") {
                    MessageBox.error(`You are trying to upload a material which is already exist.\n\n(or)\n
                                      Your are trying to upload duplicate material `);
                  } else {
                    MessageBox.error("Please check the uploaded file and upload correct data");
                  }
                  console.error("Error creating material:", err);
                }
              })
            });
  
            // Now send the batch request using batch group
            await oDataModel.submitChanges({
              batchGroupId: batchGroupId,
              success: function (oData, response) {
                // MessageBox.success("Materials batch created successfully");
                console.log("Batch request submitted", oData);
                // Perform any final operations if needed after all batch operations succeed
              },
              error: function (err) {
                MessageBox.success("Error creating material batch");
                console.error("Error in batch request:", err);
                // Handle any failure in the batch submission (e.g., server issues)
              }
            });
          } catch (error) {
            console.log(error);
            MessageToast.show("Facing technical issue")
          }
        },

        /**close Models upload Fragment */
        onClosePressXlData: function () {
          if (this.oFragment.isOpen()) {
            this.oFragment.close();
          }
        },
/***completed material batch */

      // Function to handle the batch upload event
      onbatchUploadContainers: async function (e) {
        // Check if the fragment is already loaded; if not, load it
        if (!this.oFragmentContainer) {
          this.oFragmentContainer = await this.loadFragment("ContainerXlData");
        }
        // Open the fragment dialog
        this.oFragmentContainer.open();
        // Import data from the selected file
        await this._importConatinerData(e.getParameter("files") && e.getParameter("files")[0]);
      },

      // Function to import data from an Excel file
      _importConatinerData: function (file) {
        var that = this;
        var excelData = {};

        // Check if a file is provided and if FileReader is supported by the browser
        if (file && window.FileReader) {
          var reader = new FileReader();

          // On file load, process the Excel data
          reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });

            // Iterate through each sheet in the Excel workbook
            workbook.SheetNames.forEach(function (sheetName) {
              // Convert the sheet data to JSON format
              excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

              // Add serial numbers to each row of data
              excelData.forEach(function (item, index) {
                item.serialNumber = index + 1; // Serial number starts from 1
              });
            });

            // Set the imported data to the local model and refresh the model
            that.ContainerModel.setData({ items: excelData });
            that.ContainerModel.refresh(true);
          };

          // Handle any errors during file reading
          reader.onerror = function (ex) {
            console.log(ex);
          };

          // Read the file as an ArrayBuffer
          reader.readAsArrayBuffer(file);
        }
      },

      //*Container upload logic
      // Function to handle the batch save process in container upload
      onBatchSaveContainerUpload: async function () {
        var that = this;
        var addedContainersModel = this.getView().getModel("ContainerModel").getData();
        var oDataModel = this.getView().getModel("ModelV2");
        var batchGroupIdInContainerUpload = "batchCreateGroup";

        const oView = this.getView();

        // Perform validation on the uploaded Excel data
        let raisedErrors = [];
        addedContainersModel.items.forEach(async (item, index) => {
          const aExcelInputs = [
            { value: item.truckType, regex: null, message: "Enter SAP product number" },
            { value: item.length, regex: /^\d+(\.\d+)?$/, message: "Length should be numeric" },
            { value: item.width, regex: /^\d+(\.\d+)?$/, message: "Width should be numeric" },
            { value: item.height, regex: /^\d+(\.\d+)?$/, message: "Height should be numeric" },
            { value: item.truckWeight, regex: /^\d+(\.\d+)?$/, message: "Truck Weight should be numeric" },
            { value: item.capacity, regex: /^\d+(\.\d+)?$/, message: "Capacity should be numeric" },
          ];

          // Validate each input in the Excel data
          for (let input of aExcelInputs) {
            let aValidations = this.validateField(oView, null, input.value, input.regex, input.message);
            if (aValidations.length > 0) {
              raisedErrors.push({ index: index, errorMsg: aValidations[0] });
            }
          }
        });

        // If there are any validation errors, display them and exit the process
        if (raisedErrors.length > 0) {
          for (let error of raisedErrors) {
            MessageBox.information(`Check record number ${error.index + 1} ${error.errorMsg}`);
            return;
          }
        }

        // Proceed with data transformation and saving
        try {
          addedContainersModel.items.forEach(async (item, index) => {
            delete item.serialNumber; // Remove the serial number before sending the data

            // Convert units based on the UOM (Unit of Measure)
            if (item.uom === "mm" || item.uom === "MM") {
              item.length = String((item.length) / 1000).trim();
              item.width = String((item.width) / 1000).trim();
              item.height = String((item.height) / 1000).trim();
            } else if (item.uom === "cm" || item.uom === "CM") {
              item.length = String((item.length) / 100).trim();
              item.width = String((item.width) / 100).trim();
              item.height = String((item.height) / 100).trim();
            } else {
              item.length = String(item.length).trim();
              item.width = String(item.width).trim();
              item.height = String(item.height).trim();
            }

            // Convert other attributes to uppercase and calculate volume
            item.tvuom = (item.tvuom).toUpperCase();
            item.tuom = item.tuom.toUpperCase();
            item.volume = String(item.length * item.width * item.height);
            item.uom = "M"; // Set UOM to Meters after conversion
            item.truckType = String(`${item.truckType}FT`);
            item.volume = String(item.volume);
            item.capacity = String(item.capacity);
            item.truckWeight = String(item.truckWeight);

            // Create individual batch request for each container
            await oDataModel.create("/TruckTypes", item, {
              method: "POST",
              groupId: batchGroupIdInContainerUpload, // Specify the batch group ID
              success: function (data, response) {
                if (addedContainersModel.items.length === index + 1) {
                  MessageBox.success("Containers created successfully");

                  // Close the fragment dialog and refresh the table binding
                     that.onCloseContainerUpload();
                    that.byId("idContianersTable").getBinding("items").refresh();
                  
                }
              },
              error: function (err) {
                // Handle error for individual item
                if (JSON.parse(err.responseText).error.message.value.toLowerCase() === "entity already exists") {
                  that.onCloseContainerUpload();
                  MessageBox.error(`You are trying to upload a Container which already exists.\n\n(or)\nYour are trying to upload duplicate Container`);
                } else {
                  MessageBox.error("Please check the uploaded file and upload correct data");
                  that.onCloseContainerUpload();
                }
                console.error("Error creating Container:", err);
                that.onCloseContainerUpload();
              }
            });
          });

          // Now send the batch request using the batch group
          await oDataModel.submitChanges({
            batchGroupIdInContainerUpload: batchGroupIdInContainerUpload,
            success: function (oData, response) {
              console.log("Batch request submitted", oData);
            },
            error: function (err) {
              MessageBox.success("Error creating Container batch");
              console.error("Error in batch request:", err);
            }
          });
        } catch (error) {
          console.log(error);
          MessageToast.show("Facing technical issue");
        }
      },

      // Function to handle the close button press event in the container upload fragment
      onCloseContainerUpload: function () {
        // // Close the fragment dialog if it is open
        if (!this.oFragmentContainer) {

          this.byId("idDialogContainerUpload").close();
        } else if (this.oFragmentContainer.isOpen()) {

          this.oFragmentContainer.close();
        } else {
          console.log("No action taken: oFragmentContainer exists but is not open.");
        }
      },

/****commented at 10:14 */      
      // Function to trigger the container upload
      onContainerUpload: function () {
        var oFileInputContainer = document.createElement('input');
        oFileInputContainer.type = 'file';

        // Trigger the file input click event to open the file dialog
        oFileInputContainer.click();
        oFileInputContainer.addEventListener('change', this._onFileSelectedContainer.bind(this, oFileInputContainer));
      },

      // // Function to handle file selection
      _onFileSelectedContainer: async function (oFileInputContainer) {
        // Retrieve the selected file
        var oFileContainer = oFileInputContainer.files[0];

        if (oFileContainer) {
          this.onOpenContainerBranch();
          await this._importContainerData(oFileContainer);
        }
      },

      // // Function to import data from the selected file (repeated function from earlier)
      _importContainerData: function (file) {
        var that = this;
        var excelContainerData = {};
        if (file && window.FileReader) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
            workbook.SheetNames.forEach(function (sheetName) {
              excelContainerData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
              excelContainerData.forEach(function (item, index) {
                item.serialNumber = index + 1; // Serial number starts from 1
              });
            });
            that.ContainerModel.setData({ items: excelContainerData });
            that.ContainerModel.refresh(true);
          };
          reader.onerror = function (ex) {
            console.log(ex);
          };
          reader.readAsArrayBuffer(file);
        }
      },

      onContainerEditPress: async function () {
        var oSelectedItem = this.byId("idContianersTable").getSelectedItems();
        if (oSelectedItem.length == 0) {
          MessageBox.warning("Please select at least one Record edit!");
          return;
        }
        if (oSelectedItem.length > 1) {
          MessageBox.warning("Please select only one Record for edit!");
          return;
        }
        let oPayload = oSelectedItem[0].getBindingContext().getObject();
        this.getView().getModel("CombinedModel").setProperty("/Vehicle", oPayload);
        this.onOpenContainerEdit();

      },


      //Edit function for the Container table. Present there is no requirment 
      // for any additional functionality or validation requirements Add this Code
      onSaveEditContainerPress: async function () {
        // Get the edited data from the fragment model
        const oView = this.getView(),
          oContainerModel = oView.getModel("CombinedModel"),
          oUpdateContainer = oContainerModel.getProperty("/Vehicle"),
          // Get the original product row binding context (from the selected row in the table)
          oTable = this.byId("idContianersTable"),
          oSelectedItem = oTable.getSelectedItem(),
          oContext = oSelectedItem.getBindingContext(),
          // Use the context to get the path and ID of the selected product for updating
          sPath = oContext.getPath(), // The path to the product entry in the OData model
          oModel = oView.getModel("ModelV2");

        // Create the payload for updating the product in the backend
        var oPayloadmodelupdate = {
          truckType: oUpdateContainer.truckType,
          length: oUpdateContainer.length,
          width: oUpdateContainer.width,
          height: oUpdateContainer.height,
          uom: oUpdateContainer.uom,
          volume: oUpdateContainer.volume,
          tvuom: oUpdateContainer.tvuom,
          truckWeight: oUpdateContainer.truckWeight,
          capacity: oUpdateContainer.capacity,
          tuom: oUpdateContainer.tuom, // Add any additional properties if needed
        }

        let raisedErrorsSave = [];
        const aUserInputsSave = [
          { Id: "IdContainerLength_Input", value: oPayloadmodelupdate.length, regex: /^\d+(\.\d+)?$/, message: "Length should be numeric" },
          { Id: "idContainerWidth_Input", value: oPayloadmodelupdate.width, regex: /^\d+(\.\d+)?$/, message: "Width should be numeric" },
          { Id: "idContainerHeight_Input", value: oPayloadmodelupdate.height, regex: /^\d+(\.\d+)?$/, message: "Height should be numeric" },
          { Id: "idContainerCapacity_Input", value: oPayloadmodelupdate.capacity, regex: /^\d+(\.\d+)?$/, message: "Capacity should be numeric" },
          { Id: "idContainerTruckWeight_Input", value: oPayloadmodelupdate.truckWeight, regex: /^\d+(\.\d+)?$/, message: "Truck Weight should be numeric" }
        ];

        // Add validation for empty fields
        aUserInputsSave.forEach(input => {
          if (input.value === "" || input.value === null || input.value === undefined) {
            raisedErrorsSave.push(input.message + " cannot be empty.");
          }
        });

        const validationPromisesSave = aUserInputsSave.map(async input => {
          if (input.value !== "" && input.value !== null && input.value !== undefined) {
            let aValidationsSave = await this.validateField(oView, input.Id, input.value, input.regex, input.message);
            if (aValidationsSave.length > 0) {
              raisedErrorsSave.push(aValidationsSave[0]); // Push first error into array
            }
          }
        });

        // Wait for all validations to complete
        await Promise.all(validationPromisesSave);

        // Check if there are any raised errors
        if (raisedErrorsSave.length > 0) {
          // Consolidate errors into a single message
          const errorMessageSave = raisedErrorsSave.join("\n");
          MessageBox.warning(errorMessageSave); // Show consolidated error messages
          return;
        }

        oPayloadmodelupdate.volume = String((oPayloadmodelupdate.height * oPayloadmodelupdate.width * oPayloadmodelupdate.length).toFixed(2));

        try {
          await this.updateData(oModel, oPayloadmodelupdate, sPath);
          MessageBox.success("Container details updated successfully!");
          // Close the fragment
          this.onCancelEditContainer();
          // Optionally, refresh the table binding to reflect the changes
          oTable.getBinding("items").refresh();
        } catch (oError) {
          MessageBox.error("Error updating Container details: " + oError.message);
          this.onCancelEditContainer();
        }
      },
      /***Creating New Containers */
      onSaveCreateContainer: async function () {
        let oView = this.getView(),
          oDataModel = oView.getModel("CombinedModel"),
          oProductData = oDataModel.getProperty("/Vehicle"),
          oModel = oView.getModel("ModelV2"),
          oPath = "/TruckTypes";

        if (!oProductData.truckType ||
          !oProductData.length ||
          !oProductData.width ||
          !oProductData.height ||
          !oProductData.truckWeight ||
          !oProductData.capacity) {
          MessageBox.warning("Please Enter all Values");
          return;
        }

        oProductData.truckType = `${oProductData.truckType}FT`
        oProductData.volume = String((oProductData.length * oProductData.width * oProductData.height).toFixed(2));
        var oSelectedUOM = this.byId("idCreateContainerSelectUOM").getSelectedKey();
        if (oSelectedUOM === '') {
          return MessageBox.warning("Please Select UOM")
        }
        oProductData.uom = oSelectedUOM;

        /**Error check */
        let raisedErrorsCreateContainer = [];
        const aUserInputsCreateContainer = [
          // { Id: "idDesvbncriptionInput_InitialView", value: oProductPayload.EAN, regex: null, message: "Please enter EAN" },
          { Id: "idCreateContainerTruckTypeInput", value: oProductData.truckType, regex: null, message: "Enter Truck Type" },
          { Id: "idCreateContainerLengthInput", value: oProductData.length, regex: /^\d+(\.\d+)?$/, message: "Length should be numeric" },
          { Id: "idCreateContainerWidthInput", value: oProductData.width, regex: /^\d+(\.\d+)?$/, message: "Width should be numeric" },
          { Id: "idCreateContainerHeightInput", value: oProductData.height, regex: /^\d+(\.\d+)?$/, message: "Height should be numeric" },
          { Id: "idCreateContainerCapacityInput", value: oProductData.capacity, regex: /^\d+$/, message: "Capacity should be numeric" },
          { Id: "idCreateContainerTruckWieghtInput", value: oProductData.truckWeight, regex: /^\d+$/, message: "Truck Weight should be numeric" }]
        // Create an array of promises for validation

        const validationPromisesCreateContainer = aUserInputsCreateContainer.map(async input => {
          let aValidationsCreateContainer = await this.validateField(oView, input.Id, input.value, input.regex, input.message);
          if (aValidationsCreateContainer.length > 0) {
            raisedErrorsCreateContainer.push(aValidationsCreateContainer[0]); // Push first error into array
          }
        });

        // Wait for all validations to complete
        await Promise.all(validationPromisesCreateContainer);

        // Check if there are any raised errors
        if (raisedErrorsCreateContainer.length > 0) {
          // Consolidate errors into a single message
          const errorMessageSave = raisedErrorsCreateContainer.join("\n");
          MessageBox.information(errorMessageSave); // Show consolidated error messages
          return;
        }
        oProductData.tvuom = "M³";
        oProductData.tuom = "KG";
        try {
          await this.createData(oModel, oProductData, oPath);
          MessageToast.show("Successfully Created!!");
          this.onCancelCreateContainer();
          this.byId("idContianersTable").getBinding("items").refresh();
          this.byId("idCreateContainerSelectUOM").setSelectedKey("");
        } catch (error) {
          MessageBox.error("Error Occurs at the Time of Creation!!");
          this.onCancelCreateContainer();
          this.byId("idCreateContainerSelectUOM").setSelectedKey("");
          this.byId("idContianersTable").getBinding("items").refresh();

        }
      },
      onLiveChangeForContainerType: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        if (sValue.length > 2) {
          oEvent.getSource().setValue(sValue.substring(0, 2));
        }
      },
      onLiveChangeForConatainerLength: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        if (sValue.length > 2) {
          oEvent.getSource().setValue(sValue.substring(0, 5));
        }
      },
      onLiveChangeForContainerWidth: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        if (sValue.length > 2) {
          oEvent.getSource().setValue(sValue.substring(0, 5));
        }
      },
      onLiveChangeForContainerHeight: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        if (sValue.length > 2) {
          oEvent.getSource().setValue(sValue.substring(0, 5));
        }
      },
      //         if(oSelectedItem.length > 1){
      //           MessageBox.information("Please select only one Row for edit!");
      //           return;
      //         }
      //        let oPayload = oSelectedItem[0].getBindingContext().getObject();
      //        this.getView().getModel("CombinedModel").setProperty("/Vehicle",oPayload)
      //           if (!this.oEdit) {
      //             this.oEdit = await this.loadFragment("EditContainerDetails");
      //              }
      //         this.oEdit.open();
      //         },
      //         onCancelInEditContainerDialog: function () {
      //         if (this.oEdit.isOpen()) {
      //             this.oEdit.close();
      //         }
      //       }


      //         if(oSelectedItem.length > 1){
      //           MessageBox.information("Please select only one Row for edit!");
      //           return;
      //         }
      //        let oPayload = oSelectedItem[0].getBindingContext().getObject();
      //        this.getView().getModel("CombinedModel").setProperty("/Vehicle",oPayload)
      //           if (!this.oEdit) {
      //             this.oEdit = await this.loadFragment("EditContainerDetails");
      //              }
      //         this.oEdit.open();
      //         },
      //         onCancelInEditContainerDialog: function () {
      //         if (this.oEdit.isOpen()) {
      //             this.oEdit.close();
      //         }
      //       }

    });
  });
