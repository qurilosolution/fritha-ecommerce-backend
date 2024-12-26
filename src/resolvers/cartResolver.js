const cartService=require('../services/cartService');
const cartResolver={
    Query:{
        getCart:async(_,{},context)=>{
            try{
              if(!context.user)
                throw Error("You must be logged in to get categories");
              return await cartService.getCart(context.user.id);
            }catch(err){
              throw err
            }
          },
    },
    Mutation:{
        addToCart:async(_,{productId,quantity},context)=>{
            try{
            if(!context.user){
                throw new Error("You must be logged in to add to cart");
            }
            const cart=await cartService.addToCart(context.user.id,productId,quantity);
            return cart;
        }
        catch(error){
            throw new Error('Error adding to cart: ' + error.message);
        }
        },
        removeFromCart:cartService.removeFromCart,
        updateCart:cartService.updateCart,
        // syncCart:cartService.syncCart
    }
}

module.exports=cartResolver;