const express=require('express');
const axios=require('axios');
const mongoose=require('mongoose')
require('dotenv').config();
const slackApiRoute=require('./apis/slack.js');
const sendgridApiRoute=require('./apis/sendgrid.js');

// mongoose.connect('mongodb://localhost:27017/SMB',{useNewUrlParser:true,useUnifiedTopology:true},(client,err)=>{
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log('connected to db');
//     }
// })



const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))

// app.use('/send',slackApiRoute);
app.use('/receive',sendgridApiRoute);
app.use('/slack',slackApiRoute)

app.listen(3000,()=>{
    console.log('listening to port 3000');
})

