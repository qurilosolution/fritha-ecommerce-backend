    const Cart = require('../models/cartModel');
const Product=require('../models/Product');
const Variant = require('../models/Variant');
exports.getCart = async (userId) => {
    try {
      const cart = await Cart.findOne({ userId }).populate({path:'items.product',model:Product}).populate({path:'items.variant',model:Variant});
      return cart;
    } catch (error) {
      throw new Error('Error fetching cart: ' + error.message);
    }
}  

exports.addToCart=async(userId,productId,variantId,quantity)=>{
    try{
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Validate variant if provided
    let variant = null;
    if (variantId) {
      variant = await Variant.findById(variantId);
      if (!variant) {
        throw new Error('Variant not found');
      }
    }

    const newCartItem = {
      product: product,
      variant: variantId ? variant : null,
      quantity,
    };

    // Find the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // Create a new cart if none exists
      cart = new Cart({
        userId,
        items: [newCartItem],
      });
      await cart.save();
      return newCartItem;
    } else {
      // Check if the item already exists in the cart
      const existingItem = cart.items.find(item =>
        item.product.toString() === productId.toString() &&
        (item.variant ? item.variant.toString() === (variantId || '').toString() : true)
      );

      if (existingItem) {
        // If the item exists, update the quantity
        existingItem.quantity += quantity;
      } else {
        // If the item doesn't exist, add it to the cart
        cart.items.push(newCartItem);
      }
      await cart.save();
      return newCartItem;
    }
  } catch (error) {
    throw new Error('Error adding to cart: ' + error.message);
  }
}

exports.removeFromCart=async(userId,productId,variantId)=>{
    try{
        const cart=await Cart.findOne({userId});
        if(!cart){
            throw new Error('Cart not found');
        }else{
            const product=await Product.findById(productId);
            if(!product){
                throw new Error('Product not found');
            }
            const variant=await Variant.findById(variantId);
          
            const existingItem=cart.items.find(item=>item.product.toString()===productId.toString()&&(item.variant?item.variant.toString()===variantId.toString():true));
            console.log(existingItem,"existingItemasds")
            if(existingItem){
                cart.items=cart.items.filter(item=>item._id.toString()!==existingItem._id.toString());
                await cart.save();
                const removedItem={
                    product,
                    variant:variantId?variant:null,
                    quantity:existingItem.quantity
                }
                return removedItem;
            }else{
                throw new Error('Product not found in cart');
            }
        }
    }catch(error){
        throw new Error('Error removing from cart: ' + error.message);
    }
}
exports.updateCart=async(userId,productId,variantId,quantity)=>{
    try{
        const cart=await Cart.findOne({userId});
        console.log(cart,"cart updatesfdds",productId,variantId,quantity)
        if(!cart){
            throw new Error('Cart not found');
        }else{
            const product=await Product.findById(productId);
            if(!product){
                throw new Error('Product not found');
            }
            const variant=await Variant.findById(variantId);
            const existingItem=cart.items.find(item=>item.product.toString()===productId.toString()&&(item.variant?item.variant.toString()===variantId.toString():true));
            // console.log("existingItem112")
            if(existingItem){
                console.log("existingItem",existingItem)
                existingItem.quantity=quantity;
                await cart.save();
                const updatedItem={
                    product,
                    variant:variantId?variant:null,
                    quantity
                }
                return updatedItem;
                
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
                const existingItem=cart.items.find(itm=>itm.product.toString()===item.productId.toString()&&(item.variantId?item.variantId.toString()===itm.variant.toString():true));
                if(existingItem){
                    existingItem.quantity+=item.quantity;
                }
                else{
                    cart.items.push(item);
                }
            })
            await cart.save();
            const updatedCart=await Cart.findOne({userId}).populate({path:'items.product',model:Product}).populate({path:'items.variant',model:Variant});
            return updatedCart;
        }
    }catch(error){
        throw new Error('Error syncing cart: ' + error.message);
    }
}
