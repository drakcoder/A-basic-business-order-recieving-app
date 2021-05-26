const express=require('express');
const axios=require('axios');
const slackApiRoute=require('./apis/slack.js');
const sendgridApiRoute=require('./apis/sendgrid.js');


const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use('/send',slackApiRoute);
app.use('/receive',sendgridApiRoute);

app.listen(3000,()=>{
    console.log('listening to port 3000');
})

