const AddressService = require("../services/addressService");
const addressResolver = {
  Query: {
     getAddresses:async(_,{},context)=>{
        console.log(context)
         if(!context.user){
             throw new Error("You must be logged in to get addresses");
         }
         if(!context.user.role.includes("customer")){
             throw new Error("You must be an customer to get addresses");
         }
         return await AddressService.getAddresses(context.user.id);
     },
     getDefaultAddress:async(_,{},context)=>{
        if(!context.user){
            throw new Error("You must be logged in to get default address");
        }
        if(!context.user.role.includes("customer")){
            throw new Error("You must be an customer to get default address");
        }
        try{
            return await AddressService.getDefaultAddress(context.user.id);
        }
        catch(err){
            throw new Error(err.message);
        }
       }
  },
  Mutation: {
     createAddress:async(_,args,context)=>{
         if(!context.user){
             throw new Error("You must be logged in to create address");
         }
         if(!context.user.role.includes("customer")){
             throw new Error("You must be an customer to create address");
         }
         try{
             const userId=context.user.id;
             const address=await AddressService.createAddress(userId,args.input);
             console.log(address);
             return address;
         }
         catch(err){
             throw new Error(err.message);
         }
     },
     updateAddress:async(_,args,context)=>{
         if(!context.user){
             throw new Error("You must be logged in to update address");
         }
         if(!context.user.role.includes("customer")){
             throw new Error("You must be an customer to update address");
         }
         const userId=context.user.id;
         const {id:addressId,input:address}=args;
         try{
             return await AddressService.updateAddress(userId,addressId,address);
         }
         catch(err){
             throw new Error(err.message);
         }
     },
     deleteAddress:async(_,args,context)=>{
         if(!context.user){
             throw new Error("You must be logged in to delete address");
         }
         if(!context.user.role.includes("customer")){
             throw new Error("You must be an customer to delete address");
         }
         const userId=context.user.id;
         try{
             return await AddressService.deleteAddress(userId,args.id);
         }
         catch(err){
             throw new Error(err.message);
         }
     }
  },
  
};
module.exports = addressResolver;