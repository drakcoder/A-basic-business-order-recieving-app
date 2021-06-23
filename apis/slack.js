const express=require('express');
const sgMail=require('@sendgrid/mail');
const axios=require('axios');
const mongoose=require('mongoose');

slackApiRoute=express.Router();

const channelSchema = new mongoose.Schema({
    team_id: String,
    channel_id: String,
    channel_name: String,
    email: String,
})

const slackWorkspaceSchema= new mongoose.Schema({
    access_token: String,
    user_id: String,
    team_id: String,
    enterprise_id: String,
    team_name: String,
    emails: String,
    number: String,
    channels: [channelSchema],
});

const workspaceModel= mongoose.model('workspaceDB',slackWorkspaceSchema);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

slackApiRoute.post('/send',(req,res)=>{
    const body=req.body;
    db=req.app.locals.databaseObject;
    db.findOne({'team_id':body.team_id})
        .then((doc)=>{
            if(doc==null){
                console.log('please register with the site first');
            }
            else{
                var subdoc;
                for(i of doc.channels){
                    if(i.channel_id==body.channel_id){
                        subdoc=i;
                        break;
                    }
                }
                const msg={
                    to: subdoc.email,
                    from: doc.emails,
                    subject: 'test',
                    replyTo: subdoc.email,
                    text: body.text,
                }
                sgMail.send(msg)
                    .then(()=>{
                        console.log('email sent');
                    })
                    .catch((err)=>{
                        console.log('Sendgrid ERR');
                        console.log(err.response.body);
                    })
            }
        })
        .catch((err)=>{
            console.log(err);
        })
        res.send(body.text);
})

slackApiRoute.get('/download',(req,res)=>{
    db=req.app.locals.databaseObject;
    code=req.query.code;
    console.log(code);
    const url="https://slack.com/api/oauth.access";
    const params=new URLSearchParams();
    params.append('client_id',process.env.CLIENT_ID);
    params.append('client_secret',process.env.CLIENT_SECRET);
    params.append('code',code);
    params.append('redirect_uri','https://041ad644e016.ngrok.io/slack/download');
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
                number:"+14155238886",
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