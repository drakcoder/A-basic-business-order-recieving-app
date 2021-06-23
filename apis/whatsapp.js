const express=require('express');
const mongoose=require('mongoose');
const axios=require('axios');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const channelModel=require('./sendgrid');
// console.log(accountSid,authToken);
whatsappApiRoute=express.Router();


whatsappApiRoute.post('/receive',(req,res)=>{
    db=req.app.locals.databaseObject;
    const body=req.body;
    if(body.SmsStatus=='received'){
        const toNumber=body.To.split(':')[1];
        const fromNumber=body.From.split(':')[1];
        db.findOne({number:toNumber})
            .then((obj)=>{
                if(obj==null){
                    console.log("business not registered!");
                }
                else{
                    const rawname=body.ProfileName.replace(/\s+/g, '').trim();
                    const name=rawname.replace(/[^\w\s]/gi, '').toLowerCase()
                    db.findOne({$and: [{'channels.channel_name':name},{'channels.number':fromNumber}]})
                        .then((subdoc)=>{
                            if(subdoc==null){
                                console.log(name);
                                const url='https://slack.com/api/conversations.create';
                                const params=new URLSearchParams();
                                params.append('token',obj.access_token);
                                params.append('name',name);
                                params.append('is_private',false);
                                params.append('team_id',obj.team_id);
                                const config={
                                    headers:{
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    }
                                }
                                axios.post(url,params,config)
                                .then((channelObj)=>{
                                    console.log(channelObj.data);
                                    data=(channelObj.data.channel);
                                    const record=new channelModel({
                                        team_id:obj.team_id,
                                        channel_id:data.id,
                                        channel_name:data.name,
                                        email:null,
                                        number:fromNumber,
                                    });
                                    // console.log(record);
                                    const id=obj._id;
                                    db.updateOne({_id:id},{$push : {channels:record}},{upsert:true})
                                        .then((result)=>{
                                            console.log('success');
                                        })
                                        .catch((err)=>{
                                            console.log(err);
                                        })
                                    const text=body.Body;
                                    send(text,name,obj.access_token).catch(err=>{console.log(err)});
                                    
                                })
                                .catch((err)=>{
                                    console.log(err);
                                })
                            }
                            else{
                                const text=body.Body;
                                send(text,name,obj.access_token).catch((err)=>{console.log(err)});
                            }
                        })
                }
            })
            .catch((err)=>{
                console.log(err);
            })
    }
})
whatsappApiRoute.post('/send',(req,res)=>{
    const body=req.body;
    db=req.app.locals.databaseObject;
    db.findOne({'team_id':body.team_id})
        .then((doc)=>{
            if(doc==null){
                console.log(body)
                console.log('not registered');
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
                    from: 'whatsapp:'+doc.number,
                    body: body.text,
                    to: 'whatsapp:'+subdoc.number,
                }
                client.messages.create(msg)
                .then((message)=>{console.log(message.sid)})
                .catch((err)=>{console.log(err)})
                res.send(body.text);
            }
        })
        .catch((err)=>{
            console.log(err);
            res.send(err);
        })
})

async function send(text,channelname,token){
    const url='https://slack.com/api/chat.postMessage';
    channelname='#'+channelname;
    console.log(channelname);
    const res=await axios.post(url,{
        channel:channelname,
        text:text,
    },{headers:{ authorization : `Bearer ${token}`}});
    console.log('sent');
};

module.exports=whatsappApiRoute;