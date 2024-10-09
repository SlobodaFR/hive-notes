import { Note } from '@/domain/entities/Note';

export interface NoteRepository {
    save(note: Note): Promise<Note>;
    findById(id: string): Promise<Note | null>;
    findAll(): Promise<Note[]>;
    update(note: Note): Promise<Note>;
    delete(id: string): Promise<string>;
}
