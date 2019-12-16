var FileCategoryModel = require("./FileCategory");

var ProductModel = (function(){

    /**
     * 
     * @param {String} name 
     * @param {String} uid 
     * @param {String} title 
     * @param {String} description 
     * @param {Boolean} permission
     * @param {Boolean} is_doctor
     * @param {String} doctor_url
     * @param {String} download_url
     * @param {String} storage_name
     * @param {String} product_logo_url
     */
    function ProductModel(prod_name, prod_uid, prod_title, prod_description, prod_permission, is_doctor, doctor_url, download_url, storage_name, product_logo_url) {
        this.name = prod_name;
        this.uid = prod_uid;
        this.title = prod_title;
        this.description = prod_description;
        this.permission = prod_permission;
        this.is_doctor = is_doctor;
        this.doctor_url = doctor_url;
        this.download_url = download_url;
        this.storage_name = storage_name;
        this.product_logo_url = product_logo_url;
    }
    // function ProductModel(prod_name, prod_uid, prod_title, prod_description, prod_permission, 
    //     file_category_name, file_category_uid, file_category_title, file_category_description, file_category_permission, 
    //     file_name, file_uid, file_title, file_description, file_type, file_last_edit_time, file_permission) {
    //     this.name = prod_name;
    //     this.uid = prod_uid;
    //     this.title = prod_title;
    //     this.description = prod_description;
    //     this.permission = prod_permission;
    //     FileCategoryModel.call(this, file_category_name, file_category_uid, file_category_title, file_category_description, file_category_permission,
    //         file_name, file_uid, file_title, file_description, file_type, file_last_edit_time, file_permission);
    // }
     
    return ProductModel;
})();

module.exports = ProductModel;