const mongoose=require('mongoose');

const cartSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            variant:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Variant',
                
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            }
        }
    ]
});

const Cart=mongoose.model('Cart',cartSchema);
module.exports=Cart;