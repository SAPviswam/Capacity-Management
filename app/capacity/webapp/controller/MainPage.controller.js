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
      onbatchUpload: async function (e) {
        if (!this.oFragment) {
          this.oFragment = await this.loadFragment("MaterialXlData");
        }
        this.oFragment.open();
        await this._importData(e.getParameter("files") && e.getParameter("files")[0]);
      },

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
      onClosePressXlData: function () {
        if (this.oFragment.isOpen()) {
          this.oFragment.close();
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
    _openCreateSimulationFragment:async function () {
        var oView = this.getView();

        // Check if the fragment is already loaded
        if (!this._oFragment) {
            // Load the fragment if it's not already loaded
            this._oFragment= await  this.loadFragment("CreateNewSimulaton")
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

      onbatchUpload: async function (e) {
        if (!this.oFragment) {
          this.oFragment = await this.loadFragment("MaterialXlData");
        }
        this.oFragment.open();
        await this._importData(e.getParameter("files") && e.getParameter("files")[0]);
      },

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
      onClosePressXlData: function () {
        if (this.oFragment.isOpen()) {
          this.oFragment.close();
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
    _openCreateSimulationFragment:async function () {
        var oView = this.getView();

        // Check if the fragment is already loaded
        if (!this._oFragment) {
            // Load the fragment if it's not already loaded
            this._oFragment= await  this.loadFragment("CreateNewSimulaton")
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
    }

    });
  });
