var BranchModel = (function(){
 
    /**
     * 
     * @param {Number} branch_id 
     * @param {String} branch_name 
     */
    function BranchModel(branch_id, branch_name){
        this.id = branch_id;
        this.branch_name = branch_name;
    }

    return BranchModel;
})();

module.exports = BranchModel;