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
            Value: volume,
            Label: 'Volume'
        },
          
        {
            $Type: 'UI.DataField',
            Value: stack,
            Label: 'Stack Levels'
        },
          
        {
            $Type: 'UI.DataField',
            Value: quantity,
            Label: 'Quantity'
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
            Value: Productno.ID,
        },
         {
            $Type: 'UI.DataField',
            Value: Productno.model
        },
        {
            $Type: 'UI.DataField',
            Value: SelectedQuantity
        }
    ]
});

annotate MyService.History with @(UI: {
    HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'History',
        TypeNamePlural: 'History'
    },
    SelectionFields: [
       simulationName_ID,
       truckType_truckType,
       createdAt,
       createdBy,
       modifiedAt,
       modifiedBy
       
       
    ],
    LineItem       : [
        {
            $Type: 'UI.DataField',
            Value:  simulationName_ID,
             Label: 'Simulation Name'
        },
       
        {
            $Type: 'UI.DataField',
            Value: createdAt,
            Label:'Date and Time'
        },
        {
            $Type: 'UI.DataField',
            Value: createdBy,
            Label:'Created By'
        }, {
            $Type: 'UI.DataField',
            Value: modifiedAt,
            Label:'MOdified Date and Time'
        },
        {
            $Type: 'UI.DataField',
            Value: modifiedBy,
            Label:'Modified By'
        }
    ]
});
