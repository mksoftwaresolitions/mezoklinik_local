var BranchModel = require("./Branch");
var City = require("./City");
// Dış kapsayıcı (main scope)
var Users = (function(){
 

    // // Oluşturucu (initializer) metod
    // function BranchModel(branch_id, branch_name){
    //     this.branch_id = branch_id;
    //     this.branch_name = branch_name;
    // }

    // // Oluşturucu (initializer) metod
    // function City(city_id, city_name){
    //     this.id = city_id;
    //     this.city_name = city_name;
    // }

    // Oluşturucu (initializer) metod
    /**
     * 
     * @param {Boolean} active 
     * @param {Long} birth_date 
     * @param {Number} branch_id 
     * @param {String} branch_name 
     * @param {Number} city_id 
     * @param {String} city_name 
     * @param {String} email 
     * @param {String} name_surname 
     * @param {String} phone_number 
     * @param {Number} user_role 
     * @param {String} user_uid 
     */
    function Users(active, birth_date, branch_id, branch_name, city_id, city_name, email, name_surname, phone_number, user_role, user_uid){
        this.active = active;
        this.birth_date = birth_date;
        BranchModel.call(this, branch_id, branch_name);
        City.call(this, city_id, city_name);
        this.email = email;
        this.name_surname = name_surname;
        this.phone_number = phone_number;
        this.user_role = user_role;
        this.user_uid = user_uid;
    }
     
    // Users.prototype.showName=function(){
    // alert(this.name_surname);
    // }
     

    //Propertylerini ve metodlarını eklediğimiz nesneyi en dıştaki Users değişkenine döndürüyoruz.
    return Users;
     
//En sonda çağırdığımız "()" kısmı kodun otomatik olarak çalışması ve class'ın oluşturulması içindir.
})();

module.exports = Users;