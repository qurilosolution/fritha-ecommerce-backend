const { CustomerModel } = require("../models/customerModel");

exports.createAddress = async (userId, address) => {
    try {
        const customer = await CustomerModel.findById(userId);
        console.log(customer,userId,address);
        if (!customer) {
            throw new Error("Customer not found");
        }
        customer.addresses.push(address);
        if(address.isDefault){
            const prevDefaultAddress = customer.addresses.find(address => address.isDefault === true);
            if (prevDefaultAddress) {
                prevDefaultAddress.isDefault = false;
            }
           
        }
        await customer.save();
        return customer.addresses[customer.addresses.length - 1];
    } catch (error) {
        throw new Error(error.message);
    }
}

exports.updateAddress = async (userId,addressId, address) => {
    try{
        const customer = await CustomerModel.findById(userId);
        if (!customer) {
            throw new Error("Customer not found");
        }
        // console.log(userId,addressId,address);
        const addressIndex = customer.addresses.findIndex(address => address.id === addressId);
        if (addressIndex === -1) {
            throw new Error("Address not found");
        }
       
        await customer.save();
        if(address.isDefault){
            const prevDefaultAddress = customer.addresses.find(address => address.isDefault === true);
            if (prevDefaultAddress) {
                prevDefaultAddress.isDefault = false;
            }
            
        }
        else {
            const prevDefaultAddress = customer.addresses.find(address => address.isDefault === true);
            
            if(prevDefaultAddress&&prevDefaultAddress._id.toString() === addressId.toString()){
                address.isDefault = true;
            }
        }
        address._id=addressId
        customer.addresses[addressIndex] = address;
        await customer.save();
        
        
        const updateAddress = customer.addresses[addressIndex];
        return updateAddress;
    }
    catch(err){
        throw new Error(err.message);
    }
}

exports.deleteAddress = async (userId, addressId) => {
    try{
        const customer = await CustomerModel.findById(userId);
        if (!customer) {
            throw new Error("Customer not found");
        }
        const addressIndex = customer.addresses.findIndex(address => address.id === addressId);
        if (addressIndex === -1) {
            throw new Error("Address not found");
        }
        const deleteAddress = customer.addresses[addressIndex];
        customer.addresses.splice(addressIndex, 1);
        await customer.save();
        return deleteAddress;
    }
    catch(err){
        throw new Error(err.message);
    }
}

exports.getDefaultAddress = async (userId) => {
    try{
        const customer = await CustomerModel.findById(userId);
        if (!customer) {
            throw new Error("Customer not found");
        }
        const defaultAddress = customer.addresses.find(address => address.isDefault === true);
        return defaultAddress;
    }
    catch(err){
        throw new Error(err.message);
    }
}

exports.getAddresses=async(userId)=>{
    try{    
        const customer = await CustomerModel.findById(userId);
        if (!customer) {
            throw new Error("Customer not found");
        }
        return customer.addresses;
    }
    catch(err){
        throw new Error(err.message);
    }
}