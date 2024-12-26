const {gql}=require('apollo-server-express');

const cartType=gql`
type CartItem {
    id: ID!
    product: Product!
    variant: Variant
    quantity: Int!
}
type Cart {
    id: ID!
    userId: ID!
    items: [CartItem]!
}

extend type Query {
    getCart: Cart
}

extend type Mutation {
    addToCart( productId:ID!, quantity: Int!): CartItem
    removeFromCart( productId:ID!): Cart
    updateCart( productId:ID!, quantity: Int!): Cart
}`


module.exports=cartType


