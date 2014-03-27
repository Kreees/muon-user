
module.exports = m.super.extend({
    permissions: function(req){
        if (this.session && this.session._id == this.value) return ["get","remove"];
        return ["none"]
    }
});