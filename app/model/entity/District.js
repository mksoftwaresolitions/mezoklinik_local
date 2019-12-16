// class DistrictModel {
    
//     constructor(id, district_name) {
//         this.id = id;
//         this.district_name = district_name;
//     }
    
//     getDistrictId() {
//         return this.id;
//     }

//     getDistrictName() {
//         return this.district_name;
//     }
    
//     setDistrictName(district_name) {
//         this.district_name = district_name;
//     }

// }

var DistrictModel = (function(){
 
    /**
     * 
     * @param {Number} id 
     * @param {String} district_name 
     */
    function DistrictModel(id, district_name) {
        this.id = id;
        this.district_name = district_name;
    }

    return DistrictModel;
})();

module.exports = DistrictModel;