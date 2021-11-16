const redis=require('redis')
const dotenv = require("dotenv");
dotenv.config()

const client=redis.createClient({
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
})

client.on('connect',()=>{
    console.log("client connected ")
})
client.on('error',(err)=>{
    console.log(err.message)
})
client.on('ready',(err)=>{
    console.log("client connected and read to use ")
})

module.exports=client