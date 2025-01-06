using {capacitymanagement.db as db} from '../db/datamodel';

@path: 'CapSRV'

define service MyService {
    define entity Materials       as projection on db.Materials;
    define entity TruckTypes      as projection on db.TruckTypes;
    define entity SelectedProduct as projection on db.SelectedProduct;
    define entity History         as projection on db.History;
    define entity Users           as projection on db.Users;
}

annotate MyService.Materials with @(UI: {
    HeaderInfo: {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Material',
        TypeNamePlural: 'Materials',
    },
    LineItem  : [
        {
            $Type: 'UI.DataField',
            Value: model,
            Label: 'Model/Product'
        },
        {
            $Type: 'UI.DataField',
            Value: mCategory,
            Label: 'Category'
        },
        {
            $Type: 'UI.DataField',
            Value: description,
            Label: 'Description'
        },
        {
            $Type: 'UI.DataField',
            Value: grossWeight,
            Label: 'Gross Weight'
        },
        {
            $Type: 'UI.DataField',
            Value: netWeight,
            Label: 'Net Weight'
        },
        {
            $Type: 'UI.DataField',
            Value: wuom,
            Label: 'Weight Units'
        },
        {
            $Type: 'UI.DataField',
            Value: height,
            Label: 'Height'
        },
        {
            $Type: 'UI.DataField',
            Value: length,
            Label: 'Length'
        },
        {
            $Type: 'UI.DataField',
            Value: width,
            Label: 'Width'
        },
        {
            $Type: 'UI.DataField',
            Value: uom,
            Label: 'Dimension Units'
        },
        {
            $Type: 'UI.DataField',
            Value: color,
            Label: 'Color'
        },
        {
            $Type: 'UI.DataField',
            Value: volume,
            Label: 'Volume'
        }


    ],
});


annotate MyService.Users with @(UI: {
    HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'User',
        TypeNamePlural: 'Users'
    },
    SelectionFields: [
        userID,
        fName,
        lName,
        phoneNo,
        mailID
    ],
    LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: userID
        },
        {
            $Type: 'UI.DataField',
            Value: fName
        },
        {
            $Type: 'UI.DataField',
            Value: lName
        },
        {
            $Type: 'UI.DataField',
            Value: mailID
        }
    ]
});


annotate MyService.TruckTypes with @(UI: {
    HeaderInfo: {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Truck Type',
        TypeNamePlural: 'Truck Types'
    },
    LineItem  : [
        {
            $Type: 'UI.DataField',
            Value: truckType,
            Label: 'Container Type'
        },
        {
            $Type: 'UI.DataField',
            Value: length,
            Label: 'Length'
        },
        {
            $Type: 'UI.DataField',
            Value: width,
            Label: 'Width'
        },
        {
            $Type: 'UI.DataField',
            Value: height,
            Label: 'Height'
        }
    ]
});

annotate MyService.SelectedProduct with @(UI: {
    HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Selected Product',
        TypeNamePlural: 'Selected Products'
    },
    SelectionFields: [
        ID,
        SelectedQuantity
    ],
    LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: Productno_ID
        },
        {
            $Type: 'UI.DataField',
            Value: SelectedQuantity
        }
    ]
});

annotate MyService.Materials with @(
    UI.Identification: [],
    cds.odata.valuelist,
);
