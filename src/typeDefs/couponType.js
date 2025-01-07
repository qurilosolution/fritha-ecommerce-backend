 
// const { gql } = require('apollo-server-express');

// const couponType = gql`
//   type Product {
//     id: ID!
//     name: String!
//   }

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


// const { gql } = require('apollo-server-express');

// const couponType = gql`
//   type Product {
//     id: ID!
//     name: String!
//   }

//   type Coupon {
//     id: ID!
//     code: String!                         # Coupon code (e.g., "SUMMER25")
//     discountPercentage: Float             # Percentage discount (e.g., 25%)
//     flatDiscount: Float                   # Flat discount amount (e.g., $50)
//     applicableProducts: [Product!]        # List of applicable products
//     startDate: String!                    # Coupon start date
//     endDate: String!                      # Coupon expiry date
//     maxUsage: Int!                        # Maximum usage limit
//     status: String!                       # Coupon status (active/inactive)
//     deletedAt: String                     # Timestamp for soft deletion
//   }

//   type Query {
//     getCoupon(id: ID!): Coupon            # Fetch a single coupon by ID
//     listCoupons: [Coupon!]                # List all coupons
//   }

//   type Mutation {
//     createCoupon(
//       code: String!
//       discountPercentage: Float
//       flatDiscount: Float
//       applicableProducts: [ID!]!
//       startDate: String!
//       endDate: String!
//       maxUsage: Int!
//       status: String
//     ): Coupon                             # Create a new coupon

//     updateCoupon(
//       id: ID!
//       code: String
//       discountPercentage: Float
//       flatDiscount: Float
//       applicableProducts: [ID!]
//       startDate: String
//       endDate: String
//       maxUsage: Int
//       status: String
//     ): Coupon                             # Update an existing coupon

//     deleteCoupon(id: ID!): Coupon         # Soft delete a coupon by ID
//   }
// `;

// module.exports = couponType;


const { gql } = require('apollo-server-express');

const couponType = gql`
  type Coupon {
  id: ID!
  code: String!
  discountPercentage: Float
  flatDiscount: Float
  applicableProducts: [Product!]   # Change from [ID!] to [Product!]
  startDate: String!
  endDate: String!
  maxUsage: Int!
  status: String!
  deletedAt: String
}

type Product {
  id: ID!
  name: String!
}
  
  type Query {
    getCoupon(id: ID!): Coupon            # Fetch a single coupon by ID
    listCoupons: [Coupon!]                # List all coupons
  }

  type Mutation {
    createCoupon(
      code: String!
      discountPercentage: Float
      flatDiscount: Float
      applicableProducts: [ID!]!
      startDate: String!
      endDate: String!
      maxUsage: Int!
      status: String
    ): Coupon                             # Create a new coupon

    updateCoupon(
      id: ID!
      code: String
      discountPercentage: Float
      flatDiscount: Float
      applicableProducts: [ID!]
      startDate: String
      endDate: String
      maxUsage: Int
      status: String
    ): Coupon                             # Update an existing coupon

    deleteCoupon(id: ID!): Coupon         # Soft delete a coupon by ID
  }
`;

module.exports = couponType;
