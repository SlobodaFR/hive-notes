import { injectable } from "tsyringe";
import { PrismaClient } from "@slobodafr/hive-database";
import { NoteRepository } from "@/ports/output/NoteRepository";
import { Note } from "@/domain/entities/Note";

@injectable()
export class PrismaNoteRepository implements NoteRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async save(note: Note): Promise<Note> {
        const savedNote = await this.prisma.note.create({
            data: {
                title: note.title,
                content: note.content,
                updatedTs: note.updatedTs,
                ownerId: note.ownerId,
            },
        });
        return this.mapToDomainNote(savedNote);
    }

    async findById(id: string): Promise<Note | null> {
        const note = await this.prisma.note.findUnique({
            where: { id },
        });
        return note ? this.mapToDomainNote(note) : null;
    }

    async findAll(): Promise<Note[]> {
        const notes = await this.prisma.note.findMany();
        return notes.map(this.mapToDomainNote);
    }

    async update(note: Note): Promise<Note> {
        const updatedNote = await this.prisma.note.update({
            where: { id: note.id },
            data: {
                title: note.title,
                content: note.content,
                updatedTs: note.updatedTs,
            },
        });
        return this.mapToDomainNote(updatedNote);
    }

    async delete(id: string): Promise<string> {
        await this.prisma.note.delete({
            where: { id },
        });
        return id;
    }

    private mapToDomainNote(prismaNote: any): Note {
        return new Note(
            prismaNote.id,
            prismaNote.title,
            prismaNote.content,
            prismaNote.updatedTs,
            prismaNote.ownerId
        );
    }
}
