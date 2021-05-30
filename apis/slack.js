const express=require('express');
const sgMail=require('@sendgrid/mail');
const axios=require('axios');

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
    const url="https://slack.com/api/oauth.access";
    const params=new URLSearchParams();
    params.append('client_id','2105721110720.2098371606609');
    params.append('client_secret','aacb67f8122d0c5278d792835623fb88');
    params.append('code',code);
    params.append('redirect_uri','https://b5a683b1134b.ngrok.io/slack/download');
    const config={
        headers : {
            'Content-Type':'application/x-www-form-urlencoded'
        }
    }
    axios.post(url,params,config)
        .then((result)=>{
            console.log(result.data);
        })
        .catch((err)=>{
            console.log('ERR')
            console.log(err)
        })
    res.send('sent')
})



module.exports=slackApiRoute;