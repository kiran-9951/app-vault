const mongoose = require("mongoose");
const Database = () => {
    mongoose.connect(process.env.MONGODB_URI ||"mongodb+srv://kiran:tQ9zoJlntnRXbWFn@appvault.bxgzuq5.mongodb.net/?retryWrites=true&w=majority&appName=appvault")  
    .then(() => {
        console.log("MongoDB connected"); 
    })
    .catch((error) => {
        console.error("MongoDB not connected:", error.message);
    });
};

module.exports = Database;