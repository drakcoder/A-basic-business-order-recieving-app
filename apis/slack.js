const express=require('express');
const sgMail=require('@sendgrid/mail');

slackApiRoute=express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

slackApiRoute.post('/send',(req,res)=>{
    console.log(req.body);

    const msg={
        to:'sairamgundala2000@gmail.com',
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

slackApiRoute.get('/download',(req,res)=>{
    code=req.query.code;
    console.log(code);
    res.send('sent')
})



module.exports=slackApiRoute;