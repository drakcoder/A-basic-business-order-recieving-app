const express=require('express');
const sgMail=require('@sendgrid/mail');
const axios=require('axios');
const mongoose=require('mongoose');

slackApiRoute=express.Router();

const channelSchema = new mongoose.Schema({
    team_id: String,
    channel_id: String,
    channel_name: String,
})

const slackWorkspaceSchema= new mongoose.Schema({
    access_token: String,
    user_id: String,
    team_id: String,
    enterprise_id: String,
    team_name: String,
    emails: String,
    channels: [channelSchema],
});

const workspaceModel= mongoose.model('workspaceDB',slackWorkspaceSchema);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

slackApiRoute.post('/send',(req,res)=>{
    console.log(req.body);
    db=req.app.locals.databaseObject;
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
    params.append('client_id',process.env.CLIENT_ID);
    params.append('client_secret',process.env.CLIENT_SECRET);
    params.append('code',code);
    params.append('redirect_uri','https://54f16ed4a72f.ngrok.io/slack/download');
    const config={
        headers : {
            'Content-Type':'application/x-www-form-urlencoded'
        }
    }
    axios.post(url,params,config)
        .then((result)=>{
            // console.log(result)
            const record= new workspaceModel({
                access_token:result.data.access_token,
                user_id:result.data.user_id,
                team_id:result.data.team_id,
                enterprise_id:result.data.enterprise_id,
                team_name:result.data.team_name,
                emails:"test@parse.hackevolve.com",
                channels:[]
            });
            console.log(record);
            db.insertOne(record,(err,client)=>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log('success');
                }
            })
        })
        .catch((err)=>{
            console.log('ERR')
            console.log(err)
        })
    
    res.send('sent')

})


module.exports=slackApiRoute;