import { Socket } from "socket.io";
import { io } from "../server.js";
import { authSocketManager } from "./socketManager.js";

let week = {
    sunday: {
        start: '18:20',
        end: '23:40'
    },
    monday: null,
    tuesday: {
        start: '18:20',
        end: '23:40'
    },
    wednesday: {
        start: '18:20',
        end: '23:40'
    },
    thursday: {
        start: '18:20',
        end: '23:40'
    },
    friday: {
        start: '18:20',
        end: '23:40'
    },
    saturday: {
        start: '18:20',
        end: '23:40'
    },
}

let time = {
    waitingTime: '00:30',
    timeDelivery: '00:45'
}

let open = false

let today = week[new Date().getDay()]

function setOpenAndNotify(o: boolean) {
    open = o
    socketAuth.emitToRoles(['guest', 'role_admin'], 'establishment_open', open)
}

const socketAuth = authSocketManager(io);

socketAuth.onConnectByRole(['guest', 'role_admin'], (socket: Socket) => {
    socket.emit("establishment_open", open)
    socket.emit('time', time)
})

socketAuth.onSecure({
    eventName: 'toggle_establishment_open',
    rolesAllowed: ['role_admin'],
    emitToRoles: ['role_admin'],
    handler: (socket) => {
        open = !open
        socketAuth.emitToRoles(['guest', 'role_admin'], 'establishment_open', open)
    }
})

socketAuth.onSecure({
    eventName: 'set_time',
    rolesAllowed: ['role_admin'],
    emitToRoles: ['role_admin'],
    handler: (socket, time_) => {
        time = time_
        socketAuth.emitToRoles(['guest', 'role_admin'], 'time', time)
    }
})