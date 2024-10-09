import "reflect-metadata";
import { container } from "@/config/container";
import { NoteServiceImpl } from "@/adapters/primary/grpc/NoteServiceImpl";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import {HealthImplementation, ServingStatusMap} from "grpc-health-check";
import { Logger } from "winston";
import path from "path";
import {ProtoGrpcType} from "@slobodafr/hive-contracts/notes";

const PROTO_PATH = path.resolve(__dirname, '..', 'node_modules', '@slobodafr', 'hive-contracts', 'notes.proto');
const HOST = process.env?.HOST ?? 'localhost';
const PORT = Number(process.env?.PORT ?? '4000');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const statusMap: ServingStatusMap = {
    'NotesService': 'SERVING',
    '': 'NOT_SERVING',
};
const healthImpl = new HealthImplementation(statusMap);

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

    server.bindAsync(
        `${HOST}:${PORT}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                logger.error(`Failed to start gRPC server: ${error}`);
                return;
            }
            healthImpl.setStatus('NotesService', 'SERVING');
            logger.info(`gRPC server running on port ${port}`);
        }
    );
}

startServer();
