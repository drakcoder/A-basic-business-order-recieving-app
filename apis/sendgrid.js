const express=require('express');
const axios=require('axios');
const multer=require('multer');
const mongoose=require('mongoose');

const upload=multer();
sendgridApiRoute=express.Router();
const slackToken=process.env.SLACK_TOKEN;

const channelSchema = new mongoose.Schema({
    team_id: String,
    channel_id: String,
    channel_name: String,
    email: String,
    number: String,
})

const channelModel=mongoose.model('channelModel',channelSchema);



sendgridApiRoute.post('/receive', upload.any(), (req,res)=>{
    console.log("abcd");
    text=req.body.text;
    body=req.body;
    db=req.app.locals.databaseObject;
    const email=(body.to).toLowerCase();
    const url='https://slack.com/api/chat.postMessage';
    db.findOne({'emails':body.to})
        .then((obj)=>{
            if(obj==null){
                console.log('account not registered')
            }
            else{
                // console.log(obj);
                const envelope=JSON.parse(body.envelope);
                const email=envelope.from;
                const rawname=email.split('@')[0];
                const domain=email.split('@')[1];
                const name=rawname.replace(/[^\w\s]/gi, '')+domain.split('.')[0];
                db.findOne({$and: [{'channels.channel_name':name},{'emails':body.to}]})
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
                                    // console.log(channelObj.data);
                                    data=(channelObj.data.channel);
                                    const record=new channelModel({
                                        team_id:obj.team_id,
                                        channel_id:data.id,
                                        channel_name:data.name,
                                        email:email,
                                        number:null,
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
                                    send(text,name,obj.access_token).catch(err=>{console.log(err)});
                                    
                                })
                                .catch((err)=>{
                                    console.log(err);
                                })
                        }
                        else{
                            send(text,name,obj.access_token).catch(err=>{console.log(err)});
                        }
                        
                    })
                    .catch((err)=>{
                        console.log('ERR: '+err);
                    })
            }
        })
        .catch((err)=>{
            console.log('ERR: '+err);
        })
    
    res.send('sent');
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

module.exports = {
    sendgridApiRoute,
    'channelModel': channelModel
}