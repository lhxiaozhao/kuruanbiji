// 存储封装 - 使用 localStorage（更可靠）
class NoteStorage {
    constructor() {
        this.KEY = 'coolsoft-notes-v2';
    }

    async init() {
        // localStorage 不需要初始化
        return Promise.resolve();
    }

    async add(note) {
        const notes = this.getAll();
        notes.push(note);
        this.saveAll(notes);
        return note;
    }

    async get(id) {
        const notes = this.getAll();
        return notes.find(n => n.id === id) || null;
    }

    async update(note) {
        const notes = this.getAll();
        const index = notes.findIndex(n => n.id === note.id);
        if (index !== -1) {
            notes[index] = note;
            this.saveAll(notes);
        }
        return note;
    }

    async delete(id) {
        const notes = this.getAll();
        const filtered = notes.filter(n => n.id !== id);
        this.saveAll(filtered);
    }

    async getAll() {
        const data = localStorage.getItem(this.KEY);
        return data ? JSON.parse(data) : [];
    }

    async getActive() {
        const notes = this.getAll();
        return notes.filter(n => !n.deleted);
    }

    async getStarred() {
        const notes = this.getAll();
        return notes.filter(n => n.starred && !n.deleted);
    }

    async getDeleted() {
        const notes = this.getAll();
        return notes.filter(n => n.deleted);
    }

    async search(keyword) {
        const notes = await this.getActive();
        if (!keyword) return notes;
        const lower = keyword.toLowerCase();
        return notes.filter(n => 
            n.title.toLowerCase().includes(lower) || 
            n.content.toLowerCase().includes(lower)
        );
    }

    saveAll(notes) {
        localStorage.setItem(this.KEY, JSON.stringify(notes));
    }
}

// 导出全局实例
window.storage = new NoteStorage();
