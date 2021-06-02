const express=require('express');
const axios=require('axios');
const mongoose=require('mongoose')
require('dotenv').config();
const slackApiRoute=require('./apis/slack.js');
const sendgridApiRoute=require('./apis/sendgrid.js');

mongoose.connect('mongodb://localhost:27017/SMB',{useNewUrlParser:true,useUnifiedTopology:true})
    .then((client)=>{
        console.log('connected to db');
        db=mongoose.connection;
        db=db.collection('SMB');
        app.locals.databaseObject=db;
    })
    .catch((err)=>{
        console.log('ERR');
        console.log(err);
    })

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use('/sendgrid',sendgridApiRoute);
app.use('/slack',slackApiRoute)

app.listen(3000,()=>{
    console.log('listening to port 3000');
})

