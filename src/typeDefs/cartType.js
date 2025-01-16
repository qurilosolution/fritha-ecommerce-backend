const {gql}=require('apollo-server-express');

const cartType=gql`
type CartItem {
    id: ID
    product: Product
    variant: Variant
    quantity: Int!
}
input CartItemInput {
  id: ID
  quantity: Int!
  productId: ID!
  variantId:ID
}
type Cart {
    id: ID!
    userId: ID!
    items: [CartItem]!
}
type AddToCartResponse {
    success: Boolean!
    message: String,
    data:CartItem
}
type RemoveFromCartResponse {
    success: Boolean!
    message: String
    data:CartItem
}
type GetCartResponse {
    success: Boolean!
    message: String
    data:Cart
}
 type UpdateCartResponse {
    success: Boolean!
    message: String
    data:CartItem
}

extend type Query {
    getCart: Cart
}

extend type Mutation {
    addToCart( productId:ID!,variantId:ID, quantity: Int!): AddToCartResponse
    removeFromCart( productId:ID!,variantId:ID): RemoveFromCartResponse
    updateCart( productId:ID!, quantity: Int!,variantId: ID): UpdateCartResponse
    syncCart(items:[CartItemInput]): Cart
}`


module.exports=cartType


