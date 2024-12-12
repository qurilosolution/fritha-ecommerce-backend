// const { gql } = require('apollo-server-express');

// const typeDefss = gql`
//   type User {
//     id: ID!
//     firstName: String
//     lastName: String
//     email: String!
//     phoneNumber: String
//     gender: String
//     birthDate: String
//   }

//   type AuthResponse {
//     success: Boolean
//     message: String
//     user: User
//     token: String   
//   }

//   type Query {
//     getUser(email: String!): User
//   }

//   type Mutation {
//     signup(
//       firstName: String!
//       lastName: String!
//       email: String!
//       phoneNumber: String
//       password: String!
//       gender: String
//       birthDate: String
//     ): AuthResponse

//     login(email: String!, password: String!): AuthResponse
//   }
// `;

// module.exports = { typeDefss };

//.........................................................//

// const { gql } = require('apollo-server-express');

// const typeDefss = gql`
//   type User {
//     id: ID!
//     firstName: String
//     lastName: String
//     email: String!
//     phoneNumber: String
//     gender: String
//     birthDate: String
//   }

//   type AuthResponse {
//     success: Boolean
//     message: String
//     user: User
//     token: String   
//   }

//   type Query {
//     getUser(email: String!): User
//   }

//   type Mutation {
//     signup(
//       firstName: String!
//       lastName: String!
//       email: String!
//       phoneNumber: String
//       password: String!
//       gender: String
//       birthDate: String
//     ): AuthResponse

//     login(email: String!, password: String!): AuthResponse

//     resetPassword(
//       email: String!
//       oldPassword: String!
//       newPassword: String!
//     ): AuthResponse
//   }
// `;

// module.exports = { typeDefss };

// // ..........................................................................//




const { gql } = require('apollo-server-express');

const typeDefss = gql`
  type User {
    id: ID!
    firstName: String
    lastName: String
    email: String!
    phoneNumber: String
    gender: String
    birthDate: String
  }

  type AuthResponse {
    success: Boolean
    message: String
    user: User
    token: String   
  }

  type Query {
    getUser(email: String!): User
  }

  type Mutation {
    signup(
      firstName: String!
      lastName: String!
      email: String!
      phoneNumber: String
      password: String!
      gender: String
      birthDate: String
    ): AuthResponse

    login(email: String!, password: String!): AuthResponse

    resetPassword(
      email: String!
      oldPassword: String!
      newPassword: String!
    ): AuthResponse

    sendOtp(email: String!): AuthResponse

    verifyOtp(email: String!, otp: String!): AuthResponse

    resetPasswordWithOtp(email: String!, newPassword: String!): AuthResponse
  }
`;

module.exports = { typeDefss };
