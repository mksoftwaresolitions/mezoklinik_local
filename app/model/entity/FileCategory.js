var FileModel = require("./File");
var FileCategoryModel = (function(){

    /**
     * 
     * @param {String} file_category_name 
     * @param {String} file_category_uid 
     * @param {String} file_category_title 
     * @param {String} file_category_description 
     * @param {Boolean} file_category_permission 
     * @param {String} file_name 
     * @param {String} file_uid 
     * @param {String} file_title 
     * @param {String} file_description 
     * @param {String} file_type 
     * @param {Long} file_last_edit_time 
     * @param {Boolean} file_permission 
     */
    function FileCategoryModel(file_category_name, file_category_uid, file_category_title, file_category_description, file_category_permission, 
        file_name, file_uid, file_title, file_description, file_type, file_last_edit_time, file_permission) {
        this.file_category_name = file_category_name;
        this.file_category_uid = file_category_uid;
        this.file_category_title = file_category_title;
        this.file_category_description = file_category_description;
        this.file_category_permission = file_category_permission;
        FileModel.call(this,file_name, file_uid, file_title, file_description, file_type, file_last_edit_time, file_permission);
    }
     
    return FileCategoryModel;
})();

module.exports = FileCategoryModel;