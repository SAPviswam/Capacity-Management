using {capacitymanagement.db as db} from '../db/schema';

@path: 'CapSRV'

define service MyService {

    define entity Materials       as projection on db.Materials;
    define entity TruckTypes      as projection on db.TruckTypes;
    define entity SelectedProduct as projection on db.SelectedProduct;
    define entity History         as projection on db.History;

}
