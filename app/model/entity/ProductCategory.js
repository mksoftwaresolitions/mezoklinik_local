var ProductModel = require("./Product");

var ProductCategoryModel = (function(){

    /**
     * 
     * @param {String} category_name 
     * @param {String} category_uid 
     * @param {String} category_title 
     * @param {String} category_description 
     * @param {Boolean} category_permission
     * @param {String} protuct_type_logo_url 
     */
    function ProductCategoryModel(category_name, category_uid, category_title, category_description, category_permission, protuct_type_logo_url) {
        this.name = category_name;
        this.uid = category_uid;
        this.title = category_title;
        this.description = category_description;
        this.permission = category_permission;
        this.protuct_type_logo_url = protuct_type_logo_url;
    }

    // function ProductCategoryModel2(category_name, category_uid, category_title, category_description, category_permission, 
    //     prod_name, prod_uid, prod_title, prod_description, prod_last_edit_time, prod_permission,
    //     file_category_name, file_category_uid, file_category_title, file_category_description, file_category_permission, 
    //     file_name, file_uid, file_title, file_description, file_type, file_last_edit_time, file_permission) {
    //     this.name = category_name;
    //     this.uid = category_uid;
    //     this.title = category_title;
    //     this.description = category_description;
    //     this.permission = category_permission;
    //     ProductModel.call(this, prod_name, prod_uid, prod_title, prod_description, prod_last_edit_time, prod_permission, 
    //         file_category_name, file_category_uid, file_category_title, file_category_description, file_category_permission, 
    //         file_name, file_uid, file_title, file_description, file_type, file_last_edit_time, file_permission);
    // }
     
    return ProductCategoryModel;//, ProductCategoryModel2;
})();

function getCategoryName() {
    return this.name;
}
function setCategoryName(category_name) {
    this.name = category_name;
}

module.exports = ProductCategoryModel;