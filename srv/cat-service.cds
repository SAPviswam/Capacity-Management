using {capacitymanagement.db as db} from '../db/datamodel';

@path: 'CapSRV'

define service MyService {

    define entity Users  as projection on db.Users;
    define entity Materials  as projection on db.Materials;
    define entity TruckTypes as projection on db.TruckTypes;
    define entity SelectedProduct as projection on db.SelectedProduct;
    define entity History as projection on db.History;

}
