const { gql } = require('apollo-server-express');

const bannerType = gql`

  scalar Upload

  enum BannerType {
    HERO
    PROMOTIONAL
    CATEGORY
    TESTIMONIAL
    PRODUCT_SPOTLIGHT
    EVENT_ANNOUNCEMENT
    NEWSLETTER_SIGNUP
    SEASONAL
  }
  
  type Banner {
    id: ID!
    title: String!
    imageUrl: [String]
    description: String
    position: Int
    type: BannerType!
    redirectUrl: String
  }
  
  type Query {
    banners(type: BannerType): [Banner]
    banner(id: ID!): Banner
   
  }

  type Mutation {
    createBanner(
      title: String!
      imageUrl: [Upload]
      description: String
      position: Int
      type: BannerType!
      redirectUrl: String!
    ): Banner

    updateBanner(
      id: ID!
      title: String
      imageUrl: [Upload]
      description: String
      position: Int
      type: BannerType
      redirectUrl: String
    ): Banner

    deleteBanner(id: ID!): Banner
  }
`;

module.exports = bannerType;
