// IndexedDB 封装
class NoteStorage {
    constructor(dbName = 'coolsoft-notes', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('notes')) {
                    const store = db.createObjectStore('notes', { keyPath: 'id' });
                    store.createIndex('updatedAt', 'updatedAt', { unique: false });
                    store.createIndex('starred', 'starred', { unique: false });
                    store.createIndex('deleted', 'deleted', { unique: false });
                }
            };
        });
    }

    async add(note) {
        return this._transaction('notes', 'readwrite', store => {
            return store.add(note);
        });
    }

    async get(id) {
        return this._transaction('notes', 'readonly', store => {
            return store.get(id);
        });
    }

    async update(note) {
        return this._transaction('notes', 'readwrite', store => {
            return store.put(note);
        });
    }

    async delete(id) {
        return this._transaction('notes', 'readwrite', store => {
            return store.delete(id);
        });
    }

    async getAll() {
        return this._transaction('notes', 'readonly', store => {
            return store.getAll();
        });
    }

    async getActive() {
        return this._transaction('notes', 'readonly', store => {
            const index = store.index('deleted');
            return index.getAll(IDBKeyRange.only(false));
        });
    }

    async getStarred() {
        return this._transaction('notes', 'readonly', store => {
            const index = store.index('starred');
            return index.getAll(IDBKeyRange.only(true));
        });
    }

    async getDeleted() {
        return this._transaction('notes', 'readonly', store => {
            const index = store.index('deleted');
            return index.getAll(IDBKeyRange.only(true));
        });
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

    async exportAll() {
        const notes = await this.getActive();
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            notes: notes
        };
        return JSON.stringify(data, null, 2);
    }

    async importData(jsonString) {
        const data = JSON.parse(jsonString);
        if (!data.notes || !Array.isArray(data.notes)) {
            throw new Error('Invalid import data');
        }
        for (const note of data.notes) {
            await this.update(note);
        }
        return data.notes.length;
    }

    _transaction(storeName, mode, callback) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            const request = callback(store);
            
            // 正确处理 IndexedDB request 的异步结果
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// 导出全局实例
window.NoteStorage = NoteStorage;
window.storage = new NoteStorage();
