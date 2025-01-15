const mongoose = require("mongoose");

const url = "mongodb//localhost:3000/cosmaticDatabase"

const connectDb = async() =>{
    try{
   await mongoose.connect(url , {
        useNewUrlParser :true,
        useUnifiedTopology: true
    })
    
    console.log("connect succussful" , connectDb);

}
    catch(error){
        console.log("failed connection " , error)
    } 
}

connectDb();


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true

    },
    email:{
        type: String,
        required :true
    },
    address:{
        type: String,
        required: true
    }
});



const user = new mongoose.model("User" , userSchema);


const dummyData = async()=>{
    try{
       const data = await new user({
         "name" : " Anas",
         "email ": "anas8933ald9@gmail.com",
         "address":"124eggj"
       })
       await data.save();
       console.log(data)
    }
    catch (error){
        console.log(error)
    }

}
dummyData();
