import "@babel/polyfill";
import express from "express";
import http from "http";
import SocketIO from "socket.io";
import { TimeHandler } from "./component/TimeHandler";

const app = express();
const server = http.Server(app);
const io = SocketIO(server);
const port = process.env.PORT || 3000;

async function broadcastTime(time, socket) {
  try {
    await time.update();
    socket.emit("update_time", time.getTime());
  } catch (error) {
    socket.emit("error_message", handleError(error));
  }
}

function handleError(error) {
  if (!error.response) return "API Not Found";
  switch (error.response.status) {
    case 403:
      return "API Limit Exceeded";
    default:
      return "Could Not Get Correct TimeZone";
  }
}

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
  let time = null;
  let clockInterval;
  console.info(" [*] A user connected");
  socket.emit("hello"); // Send greeting package

  socket.on("set_timezone", timezone => {
    time = new TimeHandler(timezone);
    broadcastTime(time, socket);

    clockInterval = setInterval(function() {
      broadcastTime(time, socket);
    }, 5000);
  });

  socket.on("disconnect", function() {
    console.info(" [*] User disconnected");
    clearInterval(clockInterval);
    time = null;
  });
});

server.listen(port, function() {
  console.info(` [*] Listening on *:${port}`);
});
