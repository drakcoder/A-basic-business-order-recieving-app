const express=require('express');
const sgMail=require('@sendgrid/mail');

slackApiRoute=express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

slackApiRoute.post('/',(req,res)=>{
    console.log(req.body);

    const msg={
        to:'tejaswi.koya25@gmail.com',
        from:'sairamgundala2000@hackevolve.com',
        subject:'reply',
        text:req.body.text,
    }
    sgMail.send(msg).then(()=>{
        console.log('email sent');
    })
    .catch((err)=>{
        console.log(err);
    })
    res.send(req.body.text)
})



module.exports=slackApiRoute;