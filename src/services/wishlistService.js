 
const Wishlist = require('../models/wishlistModel'); // Assuming Wishlist model is in this path

// Service to get wishlist by user
async function getWishlistByUser(userId) {
  console.log(userId,"llkkk")
  try {
    // Find the wishlist by user ID
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new Error('Wishlist not found');
    }
    return wishlist;
  } catch (error) {
    throw new Error('Error fetching wishlist for user: ' + error.message);
  }
}

// Service to get a specific wishlist item by its ID
async function getWishlistItemById(id) {
  try {
    // Find the wishlist item by its ID
    const wishlistItem = await Wishlist.findOne({ 'items._id': id });
    if (!wishlistItem) {
      throw new Error('Wishlist item not found');
    }
    return wishlistItem;
  } catch (error) {
    throw new Error('Error fetching wishlist item by ID: ' + error.message);
  }
}

// async function addToWishlist(userId, productIds) {
//   try {
//     let wishlist = await Wishlist.findOne({ userId });

//     // If no wishlist exists for the user, create a new one
//     if (!wishlist) {
//       wishlist = new Wishlist({
//         userId,
//         items: productIds.map((productId) => ({
//           productId, // Ensure this is correct (either ObjectId or String)
//           addedAt: new Date(),
//         })),
//       });
//     } else {
//       // If wishlist exists, check for existing products
//       productIds.forEach((productId) => {
//         // Log for debugging purposes
//         console.log("productId:", productId);
//         console.log("wishlist.items:", wishlist.items);

//         // Ensure productId is cast to ObjectId if necessary
//         const existingItem = wishlist.items.find(
//           (item) => item.productId && item.productId.toString() === productId.toString()
//         );

//         // If item doesn't exist, add it
//         if (!existingItem) {
//           wishlist.items.push({
//             productId,  // Ensure productId is correctly set
//             addedAt: new Date(),
//           });
//         } else {
//           // If item exists, just update the addedAt field
//           existingItem.addedAt = new Date();
//         }
//       });
//     }

//     // Save the updated wishlist
//     await wishlist.save();
//     return wishlist;
//   } catch (error) {
//     console.error(error); // Log full error for debugging
//     throw new Error('Error adding item(s) to wishlist: ' + error.message);
//   }
// }




// Service to remove a product from the wishlist


async function addToWishlist(userId, productIds) {
  try {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        items: productIds.map((productId) => ({
          productIds: [productId],  // Ensure productIds is an array
          addedAt: new Date(),
        })),
      });
    } else {
      productIds.forEach((productId) => {
        const existingItem = wishlist.items.find(
          (item) => item.productIds && item.productIds.some(id => id.toString() === productId.toString())
        );

        if (!existingItem) {
          wishlist.items.push({
            productIds: [productId],  // Ensure productIds is an array
            addedAt: new Date(),
          });
        } else {
          existingItem.addedAt = new Date();
        }
      });
    }

    // Save the updated wishlist
    await wishlist.save();
    return wishlist;
  } catch (error) {
    console.error(error); // Log full error for debugging
    throw new Error('Error adding item(s) to wishlist: ' + error.message);
  }
}





// async function removeFromWishlist(userId, productId) {
//   try {
//     // Find the user's wishlist
//     const wishlist = await Wishlist.findOne({ userId });

//     if (!wishlist) {
//       throw new Error('Wishlist not found');
//     }

//     // Remove the product from the wishlist items array
//     wishlist.items = wishlist.items.filter(
//       (item) => item.productId.toString() !== productId
//     );

//     // Save the updated wishlist
//     await wishlist.save();
//     return wishlist;
//   } catch (error) {
//     throw new Error('Error removing item from wishlist: ' + error.message);
//   }
// }

async function removeFromWishlist(userId, productId) {
  try {
    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      throw new Error('Wishlist not found');
    }

    // Remove the productId from the wishlist's items array
    wishlist.items = wishlist.items.map(item => {
      // Filter out the productId from the productIds array if it exists
      item.productIds = item.productIds.filter(id => id.toString() !== productId);
      return item;
    }).filter(item => item.productIds.length > 0); // Remove items with no products

    // Save the updated wishlist
    await wishlist.save();
    return wishlist;
  } catch (error) {
    throw new Error('Error removing item from wishlist: ' + error.message);
  }
}


module.exports = {
  getWishlistByUser,
  getWishlistItemById,
  addToWishlist,
  removeFromWishlist,
};
