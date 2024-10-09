import { Note } from '@/domain/entities/Note';

export interface NoteService {
    createNote(title: string, content: string): Promise<Note>;
    getNote(id: string): Promise<Note>;
    listNotes(): Promise<Note[]>;
    updateNote(id: string, title: string, content: string): Promise<Note>;
    deleteNote(id: string): Promise<string>;
}
