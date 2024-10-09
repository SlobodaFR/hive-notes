import { inject, injectable } from "tsyringe";
import { NoteService } from '@/ports/input/NoteService';
import { Logger } from "winston";
import { RateLimiterService } from "@/services/RateLimiterService";
import {Note} from "@/domain/entities/Note";

@injectable()
export class NoteServiceImpl {
    constructor(
        @inject("NoteService") private noteService: NoteService,
        @inject("Logger") private logger: Logger,
        @inject("RateLimiterService") private rateLimiter: RateLimiterService
    ) {}

    private async applyRateLimit(method: string, ip: string) {
        try {
            await this.rateLimiter.consume(`${ip}_${method}`);
        } catch (error) {
            this.logger.warn(`Rate limit exceeded for IP ${ip} on method ${method}`);
            throw new Error('Too many requests');
        }
    }

    async createNote(call: any, callback: any) {
        try {
            await this.applyRateLimit('createNote', call.getPeer());
            const { title, content } = call.request;
            this.logger.info(`gRPC createNote called with title: ${title}, content: ${content}`);
            const note = await this.noteService.createNote(title, content);
            callback(null, this.noteToProto(note));
        } catch (error) {
            this.logger.error(`Error in createNote: ${error}`);
            callback(error);
        }
    }

    async getNote(call: any, callback: any) {
        try {
            await this.applyRateLimit('getNote', call.getPeer());
            const { id } = call.request;
            this.logger.info(`gRPC getNote called with id: ${id}`);
            const note = await this.noteService.getNote(id);
            callback(null, this.noteToProto(note));
        } catch (error) {
            callback(error);
        }
    }

    async listNotes(call: any, callback: any) {
        try {
            await this.applyRateLimit('listNotes', call.getPeer());
            const notes = await this.noteService.listNotes();
            callback(null, { notes: notes.map(this.noteToProto) });
        } catch (error) {
            callback(error);
        }
    }

    async updateNote(call: any, callback: any) {
        try {
            await this.applyRateLimit('updateNote', call.getPeer());
            const { id, title, content } = call.request;
            this.logger.info(`gRPC getNote called with id: ${id}, title: ${title} and content: ${content}`);
            const note = await this.noteService.updateNote(id, title, content);
            callback(null, this.noteToProto(note));
        } catch (error) {
            callback(error);
        }
    }

    async deleteNote(call: any, callback: any) {
        try {
            await this.applyRateLimit('deleteNote', call.getPeer());
            const { id } = call.request;
            this.logger.info(`gRPC getNote called with id: ${id}`);
            const deletedId = await this.noteService.deleteNote(id);
            callback(null, { id: deletedId });
        } catch (error) {
            callback(error);
        }
    }

    private noteToProto(note: Note) {
        return {
            id: note.id,
            title: note.title,
            content: note.content,
            updated_ts: note.updatedTs,
            owner_id: note.ownerId,
        };
    }
}
