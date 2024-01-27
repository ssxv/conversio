import { Logger } from '@nestjs/common';
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server, ServerOptions, Socket } from "socket.io";

export class SocketIOAdapter extends IoAdapter {

    private readonly logger = new Logger(SocketIOAdapter.name);

    createIOServer(port: number, options?: ServerOptions) {
        this.logger.log('SocketIOAdapter initialised with custom CORS options');
        const optionsWithCors: ServerOptions = {
            ...options,
            cors: {
                origin: '*'
            }
        };
        const server: Server = super.createIOServer(port, optionsWithCors);
        server.of('chat').use(createTokenMiddleware());
        return server;
    }
}

const createTokenMiddleware = () => (socket: Socket, next) => {
    next();
};
