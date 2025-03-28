import express from "express";
import { Server } from "http";
import { Server as SocketServer } from "socket.io";
import { Mistral } from "@mistralai/mistralai";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const http = new Server(app);
const io = new SocketServer(http);

const apiKey = process.env.mistralAPIKey;

const client = new Mistral({apiKey: apiKey});

// Deployment of index.html using socket.io

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  })
app.use(express.static("assets"))
io.on('connection', (socket) => {  // Event listener for connection
    socket.on("movePlayed",async (id, moves)=>{
        console.log(id == socket.id)
        if(id == socket.id){
            const result = await client.agents.complete({
                messages: [
                  {
                    content:
                      moves,
                    role: "user",
                  },
                ],
                agentId: process.env.agentID,
              });
              console.log(result.choices[0].message.content)
              io.emit(`movePlayedReturn`,id, result.choices[0].message.content)
        }
    })
  })

http.listen(3333, () => { // Listening to port 3333
    console.log(`Launched`)
  });