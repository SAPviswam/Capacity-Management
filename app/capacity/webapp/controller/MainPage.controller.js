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
            mass: "",
            color: "",
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
      /**Create Product/Model */
      onCreateProduct:function(){

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
