const { gql } = require("apollo-server-express");

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

  type Image {
    url: String
    redirectUrl: String!
  }

  type Banner {
    id: ID!
    title: String!
    imageUrl: [Image]
    description: String
    position: Int
    type: BannerType!
    deletedAt: String
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    banners: [Banner]
    banner(id: ID!): Banner
    bannerByTitle(title: String!): Banner
  }

  type Mutation {
    createBanner(
      title: String!
      imageUrl: [ImageInput]
      description: String
      position: Int
      type: BannerType!
    ): Banner

    updateBanner(
      id: ID!
      title: String
      imageUrl: [ImageInput]
      description: String
      position: Int
      type: BannerType
    ): Banner

    deleteBanner(id: ID!): Banner
  }

  input ImageInput {
    image: Upload 
    redirectUrl: String!
  }
`;

module.exports = bannerType;
