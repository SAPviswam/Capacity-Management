namespace capacitymanagement.db;

using {managed} from '@sap/cds/common';

/**for custom type */

type string : String(40);

/**Defining entity */

// for unique fields

@assert.unique: {

  sapProductno: [sapProductno],
  EAN         : [EAN]

}

define entity Materials {

  key ID              : UUID;
      sapProductno    : string;
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
      weight          : String;
      wuom            : String;
      quantity        : String;
      layers          : String;
      mass            : String;
      layersHeight    : String;
      color           : String;

      selectedProduct : Association to SelectedProduct

                          on selectedProduct.Productno = $self

}

/**Defining Vehicle Entity */

define entity TruckTypes {

  key truckType   : String;
  key freezed     : Boolean;
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
