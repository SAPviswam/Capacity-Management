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
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.attachRoutePatternMatched(this.onUserDetailsLoadCapacityManagement, this);
      },
      onUserDetailsLoadCapacityManagement: async function (oEvent1) {
        debugger
        const { id } = oEvent1.getParameter("arguments");
        this.ID = id;
      },

      onAvatarPress_CapacityManagement: function (oEvent) {
        var oComponent = this.getOwnerComponent();
        // Destroy the existing popover if it exists
        if (oComponent.getPopover()) {
          oComponent.getPopover().destroy();
          oComponent.setPopover(null);
        }
        this.onPressAvatarPopOverBaseFunction();
        //this.applyStoredProfileImage();
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
      }
    });
  });
