
import { io, run, stomp } from "./server.js";
import jwt from 'jsonwebtoken'

const KEY = process.env['SECURITY_KEY']

run()

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const payload = token ? jwt.verify(token, KEY) : null;
    socket.data.user = { role: payload?.roles?.find((role: string) => role.includes("role_")) ?? 'guest' };

    // console.log(payload, socket.data.user)
    //console.log(payload?.roles?.find((role: string) => role.includes("ROLE_")))
    next();
  } catch(ex) {
    console.log(ex)
    socket.data.user = { role: 'guest' };
    next();
  }
});

import './manager/orderManager.js';
import './manager/EstablishmentManager.js'
import './manager/printerManager.js'