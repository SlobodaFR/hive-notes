export class Note {
    constructor(
        public id: string,
        public title: string,
        public content: string,
        public updatedTs: Date,
        public ownerId: string
    ) {
    }
}
