//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var customerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    billedHours: {
        type: Number,
        default: 0
    },
    id: {
        type:String,
        required:true,
        trim: true
    },
    phone: {
        type:String,
        required: true,
        trim: true
    },
    //// Map handling
    //user.socialMediaHandles.set('github', 'vkarpov15');
    //console.log(user.socialMediaHandles.get('github'));
    //user.save()
    stringProperties: {
        type: Map,
        of: String
    },
    numberProperties: {
        type: Map,
        of: Number
    },
    visits: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Visit',
            default: []
        }
    ],
    company: {
        type: String,
        required: true,
        trim: true
    }
})


//Export function to create "Client" model class
module.exports = mongoose.model("Customer", customerSchema);