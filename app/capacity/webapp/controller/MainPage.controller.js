sap.ui.define([
  "./BaseController",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
],
  function (BaseController,MessageBox,MessageToast) {
    "use strict";

    return BaseController.extend("com.app.capacity.controller.MainPage", {
      onInit() {
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
      onModelDelete:async function(){
      let oSlectedItems = this.byId("idModelsTable").getSelectedItems();
      const oModel = this.getView().getModel("ModelV2");
      if(oSlectedItems.length<1)
      {
        return MessageBox.warning("Please Select atleast One Model/Prodcut");
      }
      try{
        for(let Item of oSlectedItems){
        let sPath = Item.getBindingContext().getPath();
        await this.deleteData(oModel,sPath);
        }
        this.byId("idModelsTable").getBinding("items").refresh();
        MessageToast.show("successfully Deleted")
      }catch{
        MessageBox.error("Error Occurs!");
      }
      
      }
    });
  });
