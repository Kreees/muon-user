module.exports = {
    attributes: {
        "session_id": {
            type: "text",
            null_allowed: false
        },
        "last_view": {
            type: "date",
            null_allowed: false,
            defaults: function(){return new Date();}
        },
        "expires": {
            type: "date",
            null_allowed: false,
            defaults: function(){return new Date(Date.now()+24*3600*1000);}
        }
    },
    belongsTo:{
        "user": {
            type: "user",
            required: true
        }
    },
    objects: ["me"]
}