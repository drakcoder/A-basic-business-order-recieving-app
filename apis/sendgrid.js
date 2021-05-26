const express=require('express');
const axios=require('axios');
const multer=require('multer');

const upload=multer();
sendgridApiRoute=express.Router();
const slackToken=process.env.SLACK_TOKEN;

sendgridApiRoute.post('/',upload.any(),async (req,res)=>{
    text=req.body.text;
    send(text).catch(err=>console.log(err));
    console.log(req.body.text);
    res.send('sent');
})

async function send(text){
    const url='https://slack.com/api/chat.postMessage';
    const res=await axios.post(url,{
        channel:'#test',
        text:text,
    },{headers:{ authorization : `Bearer ${slackToken}`}});
    console.log('sent');
};

module.exports=sendgridApiRoute;