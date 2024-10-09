import {injectable, inject} from "tsyringe";
import {Note} from '@/domain/entities/Note';
import {NoteService} from '@/ports/input/NoteService';
import {NoteRepository} from '@/ports/output/NoteRepository';
import {Logger} from "winston";
import Joi from "joi";
import {randomUUID} from 'node:crypto'

const createNoteSchema = Joi.object({
    title: Joi.string().required().min(1).max(100),
    content: Joi.string().required().min(1).max(1000)
});

const updateNoteSchema = Joi.object({
    id: Joi.string().required(),
    title: Joi.string().min(1).max(100),
    content: Joi.string().min(1).max(1000)
});

@injectable()
export class NoteUseCase implements NoteService {
    constructor(
        @inject("NoteRepository") private noteRepository: NoteRepository,
        @inject("Logger") private logger: Logger
    ) {
    }

    async createNote(title: string, content: string): Promise<Note> {
        this.logger.info(`Creating note with title: ${title}`);
        const {error} = createNoteSchema.validate({title, content});
        if (error) {
            this.logger.error(`Validation error: ${error.message}`);
            throw new Error(`Validation error: ${error.message}`);
        }

        const note = new Note(
            randomUUID(),
            title,
            content,
            new Date(),
            'default-owner'
        );

        return this.noteRepository.save(note);
    }

    async getNote(id: string): Promise<Note> {
        this.logger.info(`Getting note with id: ${id}`);
        const note = await this.noteRepository.findById(id);
        if (!note) {
            this.logger.error(`Note not found with id: ${id}`);
            throw new Error('Note not found');
        }
        return note;
    }

    async listNotes(): Promise<Note[]> {
        this.logger.info('Listing all notes');
        return this.noteRepository.findAll();
    }

    async updateNote(id: string, title: string, content: string): Promise<Note> {
        this.logger.info(`Updating note with id: ${id}`);
        const {error} = updateNoteSchema.validate({id, title, content});
        if (error) {
            this.logger.error(`Validation error: ${error.message}`);
            throw new Error(`Validation error: ${error.message}`);
        }

        const existingNote = await this.getNote(id);
        const updatedNote = new Note(
            existingNote.id,
            title || existingNote.title,
            content || existingNote.content,
            new Date(),
            existingNote.ownerId
        );
        return this.noteRepository.update(updatedNote);
    }

    async deleteNote(id: string): Promise<string> {
        this.logger.info(`Deleting note with id: ${id}`);
        await this.getNote(id); // Ensure note exists
        return this.noteRepository.delete(id);
    }
}
