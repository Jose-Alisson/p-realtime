import { DefaultEventsMap, Server, Socket } from "socket.io";
import { Order } from "../model/order.js";
import { io, stomp } from "../server.js";
import { formatarData } from "../utils.js";
import { authSocketManager } from "./socketManager.js";

let realtimeDate = formatarData(new Date())
let orders: Order[] = []
let newOrders: Order[] = []

const socketAuth = authSocketManager(io);

function saveOrder(order: Order) {
    let index = orders.findIndex(o => o.id === order.id)

    if (index != -1) {
        orders[index] = order
    } else {
        if (formatarData(new Date(order.dateCreation)) === realtimeDate) {
            orders.push(order)
        }
        newOrders.push(order)
        socketAuth.emitToRoles(['admin'], 'new_orders', newOrders)
        socketAuth.emitToRoles(['admin'], 'notification', { title: 'Novo pedido', body: `Você tem ${newOrders.length} ainda não visualizadas` })
    }

    socketAuth.emitToRoles(['admin'], 'orders', orders)
}

function removerNewOrder(id: number) {
    let index = newOrders.findIndex(no => no.id === id)
    if (index != -1) {
        newOrders.splice(index, 1)
        socketAuth.emitToRoles(['admin'], 'new_orders', newOrders)
    }
}

function registerOrderStomp(){
    stomp.publish({
        destination: "/app/send/getOrders",
        body: JSON.stringify({ date: realtimeDate })
    });
    
    stomp.subscribe('/topic/orders', (message) => {
        orders = JSON.parse(message.body)
        socketAuth.emitToRoles(['admin'], 'orders', orders)
    })
    
    stomp.subscribe('/topic/order/add', (message) => {
        saveOrder(JSON.parse(message.body))
    })

}

socketAuth.onConnectByRole(['admin'], (socket: Socket) => {
    socket.emit("current_date", realtimeDate)
    socket.emit("orders", orders)
    socket.emit("new_orders", newOrders)

    console.log("Conectou", socket.id, socket.data)
})

socketAuth.onSecure({
    eventName: 'set_current_date',
    emitToRoles: ['admin'],
    rolesAllowed: ['admin'],
    handler: (socket, date) => {
        const [ano, mes, dia] = date.split('-').map(Number);
        realtimeDate = formatarData(new Date(ano, mes - 1, dia))
        // console.log(realtimeDate)

        stomp.publish({
            destination: "/app/send/getOrders",
            body: JSON.stringify({ date: realtimeDate })
        });

        socketAuth.emitToRoles(['admin'], 'current_date', realtimeDate)
    }
})

socketAuth.onSecure({
    eventName: 'remover_new_order',
    emitToRoles: ['admin'],
    rolesAllowed: ['admin'],
    handler: (socket, id) => {
        removerNewOrder(id)
    }
})


export {
    registerOrderStomp,
    realtimeDate
}
