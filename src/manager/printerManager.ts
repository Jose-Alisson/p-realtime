import { Socket } from "socket.io";
import { io } from "../server.js";
import { authSocketManager } from "./socketManager.js";

let printers: { printer: string, Id_s: string }[] = []

const socketAuth = authSocketManager(io);

socketAuth.onConnectByRole(['admin'], (socket: Socket) => {
    socket.emit('printes', printers.map(p => p.printer))
})

socketAuth.onSecure({
    eventName: 'register_printer',
    emitToRoles: ['admin'],
    rolesAllowed: ['admin'],
    handler: (socket, printer) => {
        let index = printers.findIndex(p => p.printer === printer)
        if (index != -1) {
            printers[index] = { printer: printer, Id_s: socket.id }
        } else {
            printers.push({ printer: printer, Id_s: socket.id })
        }
        socketAuth.emitToRoles(['admin'], 'printes', printers.map(p => p.printer))
    }
})

socketAuth.onSecure({
    eventName: 'print',
    emitToRoles: ['admin'],
    rolesAllowed: ['admin'],
    handler: (socket, printer, type, text, obj) => {
        let id = printers.find(p => p.printer === printer)?.Id_s
        if (id) {
            io.to(id).emit("print", type, text, obj)
        }
    }
})