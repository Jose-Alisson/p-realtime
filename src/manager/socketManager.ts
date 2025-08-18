import { Server, Socket } from "socket.io";

function emitToRoles(io: Server, roles = [], eventName, data) {
    if (!Array.isArray(roles)) {
        roles = [roles]; // transforma em array automaticamente
    }

    const sockets = Array.from(io.sockets.sockets.values());

    for (const socket of sockets) {
        const role = socket.data.user?.role || 'guest';
        if (roles.includes(role)) {
            socket.emit(eventName, data);
        }
    }
}

function authSocketManager(io: Server) {
    const registeredEvents = [];
    const roleConnectHandlers = {}; // <-- NOVO

    io.on('connection', (socket: Socket) => {
        const role = socket.data.user?.role || 'guest';

        // Executa todas as funções registradas para a role do socket
        const fns = roleConnectHandlers[role] || [];
        fns.forEach(fn => fn(socket));

        // Registra handlers para este socket
        for (const evt of registeredEvents) {
            if (evt.rolesAllowed.includes(role)) {
                socket.on(evt.eventName, async (...data) => {
                    // Proteção extra
                    if (!evt.rolesAllowed.includes(socket.data.user?.role)) return;
                    const result = await evt.handler(socket, ...data);

                    // if (evt.autoEmitToRoles) {
                    //     if (evt.emitToOwnSocket) {
                    //         // Emite apenas para o próprio socket
                    //         socket.emit(evt.eventName, result);
                    //     } else if (evt.emitToRoles.length > 0) {
                    //         // Emite para as roles definidas
                    //         emitToRoles(io, evt.emitToRoles, evt.eventName, result);
                    //     }
                    // }
                });
            }

            // Adiciona socket à "sala do evento" se ele tiver permissão para receber
            if (evt.emitToRoles?.includes(role)) {
                socket.join(evt.eventName);
            }
        }
    });

    return {
        /**
         * Registra evento com controle de roles
         */
        onSecure: ({ eventName, handler, rolesAllowed = ['guest'], emitToRoles = [] }) => {
            registeredEvents.push({ eventName, handler, rolesAllowed, emitToRoles });
        },

        /**
         * Emite evento apenas para sockets com determinadas roles
         */
        emitToRoles: (roles, eventName, data) => {
            emitToRoles(io, roles, eventName, data);
        },

        /** <-- NOVO: dispara eventos ao conectar por role */
        onConnectByRole: (roles, fn) => {
            if (!Array.isArray(roles)) roles = [roles];
            for (const role of roles) {
                if (!roleConnectHandlers[role]) {
                    roleConnectHandlers[role] = [];
                }
                roleConnectHandlers[role].push(fn);
            }
        }
    };
}

export {
    authSocketManager
}
