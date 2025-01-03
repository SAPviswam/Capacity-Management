sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/app/capacity/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("com.app.capacity.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            // Load config.json
            const oConfigModel = new sap.ui.model.json.JSONModel();
            oConfigModel.loadData("utils/config.json");
            this.setModel(oConfigModel, "config");

            // enable routing
            this.getRouter().initialize();
        }
    });
});
