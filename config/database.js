const mongoose=require("mongoose");
require("dotenv").config();

exports.connect=()=>{
    mongoose.connect(process.env.MONGODB_URL,{
// useNewUrlParser:true,
// useUnifiedTopology:true,
    })
    .then(()=>console.log("DB ka connection wsuccessfully"))
    .catch((error)=>{
        console.log("DB ka connection nhi hua");
        console.error(error);
        process.exit(1);
    })
};