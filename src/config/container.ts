import "reflect-metadata";
import { container as tsyringeContainer } from "tsyringe";
import { NoteRepository } from "@/ports/output/NoteRepository";
import { NoteUseCase } from "@/domain/use-cases/NoteUseCase";
import { NoteServiceImpl } from "@/adapters/primary/grpc/NoteServiceImpl";
import { Logger } from "winston";
import { createLogger, format, transports } from "winston";
import { RateLimiterService } from "@/services/RateLimiterService";
import { PrismaNoteRepository } from "@/adapters/secondary/database/PrismaNoteRepository";
import {NoteService} from "@/ports/input/NoteService";

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' })
    ]
});

const container = tsyringeContainer.register<Logger>("Logger", { useValue: logger });
container.register<NoteRepository>("NoteRepository", { useClass: PrismaNoteRepository });
container.register<NoteService>("NoteService", { useClass: NoteUseCase });
container.register<NoteServiceImpl>("NoteServiceImpl", { useClass: NoteServiceImpl });
container.register<RateLimiterService>("RateLimiterService", { useClass: RateLimiterService });

export { container };
