import "reflect-metadata";
import { container } from "@/config/container";
import { NoteServiceImpl } from "@/adapters/primary/grpc/NoteServiceImpl";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
// @ts-ignore
import {servingStatus, Implementation, service} from "grpc-js-health-check";
import { Logger } from "winston";
import path from "path";
import {ProtoGrpcType} from "@slobodafr/hive-contracts/notes";

const PROTO_PATH = path.resolve(__dirname, '..', 'node_modules', '@slobodafr', 'hive-contracts', 'notes.proto');
const HOST = process.env?.HOST ?? '0.0.0.0';
const PORT = Number(process.env?.PORT ?? '4000');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const statusMap = {
    'NotesService': servingStatus.NOT_SERVING,
    '': servingStatus.NOT_SERVING,
};
const healthImpl = new Implementation(statusMap);

const noteProto = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;

function startServer() {
    const server = new grpc.Server();
    healthImpl.addToServer(server);
    const noteService = container.resolve<NoteServiceImpl>("NoteServiceImpl");
    const logger = container.resolve<Logger>("Logger");

    server.addService(noteProto.notes.NotesService.service, {
        createNote: noteService.createNote.bind(noteService),
        getNote: noteService.getNote.bind(noteService),
        listNotes: noteService.listNotes.bind(noteService),
        updateNote: noteService.updateNote.bind(noteService),
        deleteNote: noteService.deleteNote.bind(noteService),
    });

    console.log(`Starting gRPC server on ${HOST}:${PORT}`);

    server.bindAsync(
        `${HOST}:${PORT}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            try {
                if (error) {
                    logger.error(`Failed to start gRPC server: ${error}`);
                    return;
                }
                healthImpl.setStatus('NotesService', servingStatus.SERVING);
                logger.info(`gRPC server running on port ${port}`);
            } catch (e) {
                logger.error(`Failed to start gRPC server: ${e}`);
            }
        }
    );
}

startServer();
