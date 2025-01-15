const { gql } = require('apollo-server-express');

const authType = gql`
  type User {
    id: ID!
    firstName: String
    lastName: String
    email: String!
    phoneNumber: String
    gender: String
    birthDate: String
  }
  type Response{
    success: Boolean
    message: String
  }
  type OtpResponse{
    success: Boolean
    message: String
    token: String
  }
  type AuthResponse {
    success: Boolean
    message: String
    user: User
    token: String   
  }
  type ProfileResponse{
    success: Boolean
    message: String
    profile:User
  } 
  type Query {
     getUser: User
     getProfile: ProfileResponse
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

    adminSignup(firstName:String!,lastName:String,aemail:String!,password:String!): AuthResponse
    adminLogin(email: String!, password: String!): AuthResponse
    login(email: String!, password: String!): AuthResponse
    changePassword(
      oldPassword: String!
      newPassword: String!
    ): Response

    updateProfile(
      firstName: String
      lastName: String
      email: String
      phoneNumber: String
      gender: String
      birthDate: Date
      ):ProfileResponse

   

    sendOtp(email: String!): Response

    verifyOtp(email: String!, otp: String!): OtpResponse

    resetPassword(newPassword: String!,token: String):  Response
    
  }
`;

module.exports = authType;
