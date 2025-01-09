const cartService=require('../services/cartService');
const cartResolver={
    Query:{
        getCart:async(_,{},context)=>{
            try{
              if(!context.user)
                throw Error("You must be logged in to get categories");
              console.log(context.user.id,"id");
              return await cartService.getCart(context.user.id);
            }catch(err){
              throw err
            }
          },
    },
    Mutation:{
        addToCart:async(_,{productId,variantId,quantity},context)=>{
            try{
              console.log(productId,variantId,quantity)
            if(!context.user){
                throw new Error("You must be logged in to add to cart");
            }
            const newCartItem=await cartService.addToCart(context.user.id,productId,variantId,quantity);
            
            return {
                success:true,
                message:"Item added to cart successfully",
                data:newCartItem
            } 
        }
        catch(error){
            throw new Error('Error adding to cart: ' + error.message);
        }
        },
        removeFromCart:async(_,{productId,variantId},context)=>{
          try{
            console.log(productId,variantId)
          if(!context.user){
              throw new Error("You must be logged in to add to cart");
          }
          const removedItem=await cartService.removeFromCart(context.user.id,productId,variantId);
          return {
              success:true,
              message:"Item removed from cart successfully",
              data:removedItem
          } 
      }
      catch(error){
          throw new Error('Error adding to cart: ' + error.message);
      }
      },
        updateCart:async(_,{productId,variantId,quantity},context)=>{
          try{
            console.log(productId,variantId,quantity)
          if(!context.user){
              throw new Error("You must be logged in to add to cart");
          }
          const updatedItem=await cartService.updateCart(context.user.id,productId,variantId,quantity);
          return {
              success:true,
              message:"Item quantity updated from cart successfully",
              data:updatedItem
          } 
      }
      catch(error){
          throw new Error('Error adding to cart: ' + error.message);
      }
      },
      syncCart:async(_,{items},context)=>{
        try{
         
        if(!context.user){
            throw new Error("You must be logged in to add to cart");
        }
        const cart =await cartService.syncCart(context.user.id,items);
        return cart
    }
    catch(error){
        throw new Error('Error adding to cart: ' + error.message);
    }
    }
    }
}
 


module.exports=cartResolver;