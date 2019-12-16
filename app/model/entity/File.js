
var FileModel = (function(){

    /**
     * 
     * @param {String} file_name 
     * @param {String} file_uid 
     * @param {String} file_title 
     * @param {String} file_description 
     * @param {String} file_type 
     * @param {Long} last_edit_time 
     * @param {Boolean} permission 
     */
    function FileModel(file_name, file_uid, file_title, file_description, file_type, last_edit_time, permission) {
        this.file_name = file_name;
        this.file_uid = file_uid;
        this.file_title = file_title;
        this.file_description = file_description;
        this.file_type = file_type;
        this.last_edit_time = last_edit_time;
        this.permission = permission;
    }
     
    return FileModel;
})();

module.exports = FileModel;