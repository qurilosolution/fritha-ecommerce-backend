const Cart = require('../models/cartModel');
const Product=require('../models/Product')
exports.getCart = async (userId) => {
    try {
      const cart = await Cart.findOne({ userId }).populate({path:'items.product',model:Product});
      return cart;
    } catch (error) {
      throw new Error('Error fetching cart: ' + error.message);
    }
}  

exports.addToCart=async(userId,productId,quantity)=>{
    try{
        const cart=await Cart.findOne({userId});
        if(!cart){
            const newCart=new Cart({userId,items:[{productId,quantity}]});
            await newCart.save();
            return newCart;
        }else{
            const existingItem=cart.items.find(item=>item.productId.toString()===productId.toString());
            if(existingItem){
                existingItem.quantity+=quantity;
                await cart.save();
                return cart;
            }else{
                cart.items.push({productId,quantity});
                await cart.save();
                return cart;
            }
        }
    }

  catch(error){
    throw new Error('Error adding to cart: ' + error.message);
  }
}

exports.removeFromCart=async(userId,productId)=>{
    try{
        const cart=await Cart.findOne({userId});
        if(!cart){
            throw new Error('Cart not found');
        }else{
            const existingItem=cart.items.find(item=>item.productId.toString()===productId.toString());
            if(existingItem){
                cart.items=cart.items.filter(item=>item.productId.toString()!==productId.toString());
                await cart.save();
                return cart;
            }else{
                throw new Error('Product not found in cart');
            }
        }
    }catch(error){
        throw new Error('Error removing from cart: ' + error.message);
    }
}
exports.updateCart=async(userId,productId,quantity)=>{
    try{
        const cart=await Cart.findOne({userId});
        if(!cart){
            throw new Error('Cart not found');
        }else{
            const existingItem=cart.items.find(item=>item.productId.toString()===productId.toString());
            if(existingItem){
                existingItem.quantity=quantity;
                await cart.save();
                return cart;
            }else{
                throw new Error('Product not found in cart');
            }
        }
    }catch(error){
        throw new Error('Error updating cart: ' + error.message);
    }
}

exports.syncCart=async(userId,items)=>{
    try{
        const cart=await Cart.findOne({userId});
        if(!cart){
            throw new Error('Cart not found');
        }else{
            items.forEach(item=>{
                const existingItem=cart.items.find(existingItem=>existingItem.productId.toString()===item.productId.toString());
                if(existingItem){
                    existingItem.quantity=item.quantity;
                }
                else{
                    cart.items.push(item);
                }
            })
            await cart.save();
            return cart;
        }
    }catch(error){
        throw new Error('Error syncing cart: ' + error.message);
    }
}
