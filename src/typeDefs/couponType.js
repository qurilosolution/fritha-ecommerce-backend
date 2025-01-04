// const { gql } = require('apollo-server-express');

// const couponType = gql`
//   type Coupon {
//     id: ID!                              
//     code: String!                        
//     discountPercentage: Float!          
//     applicableProducts: [Product!]       
//     startDate: String!                    
//     endDate: String!                   
//     maxUsage: Int!                       
//     status: String!                       
//     deletedAt: String                    
//   }

//   type Query {
//     getCoupon(id: ID!): Coupon           
//     listCoupons: [Coupon!]            
//   }

//   type Mutation {
//     createCoupon(
//       code: String!
//       discountPercentage: Float!
//       applicableProducts: [ID!]!
//       startDate: String!
//       endDate: String!
//       maxUsage: Int!
//       status: String
//     ): Coupon                          

//     updateCoupon(
//       id: ID!
//       code: String
//       discountPercentage: Float
//       applicableProducts: [ID!]
//       startDate: String
//       endDate: String
//       maxUsage: Int
//       status: String
//     ): Coupon                            

//     deleteCoupon(id: ID!): Coupon       
//   }
// `;

// module.exports = couponType;


const { gql } = require('apollo-server-express');

const couponType = gql`
  type Product {
    id: ID!
    name: String!
  }

  type Coupon {
    id: ID!                             
    code: String!                        
    discountPercentage: Float!          
    applicableProducts: [Product!]       
    startDate: String!                    
    endDate: String!                    
    maxUsage: Int!                       
    status: String!                       
    deletedAt: String                    
  }

  type Query {
    getCoupon(id: ID!): Coupon           
    listCoupons: [Coupon!]            
  }

  type Mutation {
    createCoupon(
      code: String!
      discountPercentage: Float!
      applicableProducts: [ID!]!
      startDate: String!
      endDate: String!
      maxUsage: Int!
      status: String
    ): Coupon                          

    updateCoupon(
      id: ID!
      code: String
      discountPercentage: Float
      applicableProducts: [ID!]
      startDate: String
      endDate: String
      maxUsage: Int
      status: String
    ): Coupon                            

    deleteCoupon(id: ID!): Coupon       
  }
`;

module.exports = couponType;
