const mongoose = require('mongoose');
const uri = "mongodb+srv://ikjhgkunal_db_user:wKRhTo9X89BS58jE@cluster0.atohf27.mongodb.net/MovieDatabase?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:");
    console.error(err.message);
    process.exit(1);
  });
