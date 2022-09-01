import express from 'express'  // es6 format
import cors from 'cors' // install it as - npm install cors
import mongoose from 'mongoose'

// connect to database
//let db_name = 'socialMediaBase'
let dbURI = "mongodb+srv://mhamza:hamza.123@cluster0.yy24d35.mongodb.net/socialMediaBase?retryWrites=true&w=majority";
mongoose.connect(dbURI);


////////////////mongodb connected disconnected events///////////////////////////////////////////////
mongoose.connection.on('connected', function() {//connected
    console.log("Mongoose is connected");
    // process.exit(1);
});

mongoose.connection.on('disconnected', function() {//disconnected
    console.log("Mongoose is disconnected");
    process.exit(1); // Close the app if database is disconnected in any case.
});

mongoose.connection.on('error', function(err) {//any error
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', function() {/////this function will run jst before app is closing
    console.log("app is terminating");
    mongoose.connection.close(function() {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});
// ======================Db Connection=======================================



const app = express() // for decrypting the data
app.use(express.json());  //  for parsing json data

app.use(cors());

const port = process.env.PORT || 3000  // for deploying on heroku, it is mandatory
//let usersBase = [];   // TODO: Replace this with MongoDb
const userSchema = new mongoose.Schema({
    name: String,
    email: {type: String, required:true},
    password: {type: String, required:true},
    city: String,

    age: {type: Number, min: 18, max:18, default: 18},
    isMarried:{type:Boolean, default:false},
    createdOn: { type:Date, default: Date.now }
  });

  const userModel = mongoose.model('User', userSchema);

app.post('/signup', (req, res) => {
    let body = req.body;
    // validation
    if(!body.name || !body.email || !body.password || !body.city){
        res.status(400).send(`All fields are required.`);
        return;
    }


    let newUser = new userModel({
        name: body.name,
        email: body.email.toLowerCase(),
        password: body.password,
        city: body.city
    })

    newUser.save((err, result) => {
        if(!err){
            // data saved
            res.status(200).send({message:"Your account has been created successfully."});
        }else{
            console.log("Db error", err);
            res.status(500).send({message:"Some error occurred! Please try again."});
        }
    });

    

})

// login user
app.post('/signin', (req, res) => {
    let body=req.body;
    if(!body.email || !body.password){
        res.status(400).send(
            {message: "Email and password are required."}
        );
        return;
    }

    let isFound = false;

    for(let i = 0; i < usersBase.length; i++){
        if(usersBase[i].email === body.email){
            isFound = true;
            if(usersBase[i].password === body.password){// correct password
                res.status(200).send(
                    {
                        name:usersBase[i].name,
                        email:usersBase[i].email,
                        city:usersBase[i].city,
                        message:"Login Successful"
                    }
                );
                return;

            }else{  // incorrect password
                res.status(401).send(
                    {
                        message: "Incorrect password"
                    }
                );
                return;
            }
        }
        
    }

    if(!isFound){
        res.status(404).send(
            {
                message:"User not found"
            }
        );
        return;
    }
})


// ********** By defualt code **********
app.get('/', (req, res) => {
  console.log("Aik request server per i.")
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})