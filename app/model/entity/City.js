var DistrictModel = require("./District");
var CitiesModel = (function(){
    this.city_name = "Şehir";
    /**
     * 
     * @param {Number} city_id 
     * @param {String} city_name 
     * @param {Array<DistrictModel>} districtModels 
     */
    function CitiesModel(id, city_name, districtModels) {
        this.id = id;
        this.city_name = city_name;
        DistrictModel.call(this, districtModels);
    }

    return CitiesModel;
})();

// class CitiesModel {
//     /**
//      * 
//      * @param {Number} city_id 
//      * @param {String} city_name 
//      * @param {Array<DistrictModel>} distModel 
//      */
//     constructor(city_id, city_name, distModel) {
//         this.city_id = city_id;
//         this.city_name = city_name;
//         this.distModel = distModel;
//     }
    
//     getCityId() {
//         return this.city_id;
//     }
//     getCityName() {
//         return this.city_name;
//     }
//     setCityName(city_name) {
//         this.city_name = city_name;
//     }
    // getDistrictName() {
    //     return this.city_name;
    // }
    // setDistrictName(distModel) {
    //     this.city_name = city_name;
    // }
// }

module.exports = CitiesModel;