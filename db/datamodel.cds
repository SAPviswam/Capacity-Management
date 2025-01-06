namespace capacitymanagement.db;

using {
    cuid,
    managed
} from '@sap/cds/common';


/**for custom type */
type string : String(40);

/**Defining entity */

// for unique fields

define entity Users : cuid {
    userID       : String;
    fName        : String;
    lName        : String;
    phoneNo      : String;
    mailID       : String;
    password     : String;
    profileImage : String;
    expireDate   : String;
}

@assert.unique: {model: [model]

}
 
define entity Materials {
    key ID              : UUID;
        model           : string;
        EAN             : String;
        length          : String;
        width           : String;
        height          : String;
        volume          : String;
        vuom            : String;
        muom            : String;
        uom             : String;
        mCategory       : string;
        description     : String;
        netWeight       : String;
        grossWeight     : String;
        wuom            : String;
        quantity        : String;
        stack           : String;
        mass            : String;
        selectedProduct : Association to SelectedProduct
                              on selectedProduct.Productno = $self

}

/**Defining Vehicle Entity */
 
define entity TruckTypes {
    key truckType   : String  ;
        length      : String;
        width       : String;
        height      : String;
        uom         : String;
        volume      : String;
        tvuom       : String;
        truckWeight : String;
        capacity    : String;
        tuom        : String;
}
define entity SelectedProduct {
    key ID               : UUID;
        Productno        : Association to Materials;
        SelectedQuantity : String;
}

 
define entity History : managed {
    key ID        : UUID;
        productNo : Association to SelectedProduct;
        truckType : Association to TruckTypes;

}
