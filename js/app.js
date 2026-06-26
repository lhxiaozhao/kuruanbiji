// 主应用逻辑
class NotesApp {
    constructor() {
        this.currentNote = null;
        this.filter = 'all';
        this.searchQuery = '';
        this.autoSaveTimer = null;
        this.init();
    }

    async init() {
        await storage.init();
        this.bindEvents();
        this.renderNoteList();
        this.createWelcomeNote();
    }

    bindEvents() {
        // 新建笔记
        document.getElementById('newNote').addEventListener('click', () => this.createNewNote());

        // 搜索
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.renderNoteList();
        });

        // 筛选标签
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.filter = e.target.dataset.filter;
                this.renderNoteList();
            });
        });

        // 编辑器事件
        document.getElementById('noteTitle').addEventListener('input', () => this.autoSave());
        document.getElementById('noteContent').addEventListener('input', () => {
            this.autoSave();
            this.updateWordCount();
        });

        // 操作按钮
        document.getElementById('togglePreview').addEventListener('click', () => this.togglePreview());
        document.getElementById('toggleStar').addEventListener('click', () => this.toggleStar());
        document.getElementById('deleteNote').addEventListener('click', () => this.deleteNote());
        document.getElementById('exportNote').addEventListener('click', () => this.exportNote());

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    this.saveCurrentNote();
                } else if (e.key === 'n') {
                    e.preventDefault();
                    this.createNewNote();
                } else if (e.key === 'f') {
                    e.preventDefault();
                    document.getElementById('searchInput').focus();
                }
            }
        });
    }

    createWelcomeNote() {
        const notes = storage.getActive();
        if (notes.length === 0) {
            const welcomeNote = {
                id: this.generateId(),
                title: '👋 欢迎使用酷软笔记',
                content: `# 欢迎使用酷软笔记

这是一个纯前端的笔记应用，数据保存在本地，无需联网即可使用。

## 功能特性

- ✅ **Markdown 编辑**：支持标题、列表、代码块、表格等
- ✅ **实时预览**：点击预览按钮查看渲染效果
- ✅ **本地存储**：数据保存在浏览器 IndexedDB，安全可靠
- ✅ **离线可用**：支持 PWA，离线也能使用
- ✅ **搜索功能**：快速查找历史笔记
- ✅ **收藏功能**：标记重要笔记
- ✅ **导出功能**：支持导出为 Markdown 文件

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl + S | 保存笔记 |
| Ctrl + N | 新建笔记 |
| Ctrl + F | 搜索笔记 |

## Markdown 语法示例

### 文本格式

**粗体文字** 和 *斜体文字*

### 列表

- 无序列表项 1
- 无序列表项 2
- 无序列表项 3

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

### 代码块

\`\`\`javascript
function hello() {
    console.log('Hello, World!');
}
\`\`\`

### 表格

| 功能 | 状态 |
|------|------|
| 编辑 | ✅ |
| 预览 | ✅ |
| 导出 | ✅ |

### 引用

> 这是一段引用文字

### 链接

[酷软科技](https://www.coolsoft.com)

---

开始写作吧！📝`,
                starred: false,
                deleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            storage.add(welcomeNote);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createNewNote() {
        const note = {
            id: this.generateId(),
            title: '',
            content: '',
            starred: false,
            deleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        storage.add(note);
        this.currentNote = note;
        this.renderEditor();
        this.renderNoteList();
        document.getElementById('noteTitle').focus();
    }

    async loadNote(id) {
        const note = await storage.get(id);
        if (note) {
            this.currentNote = note;
            this.renderEditor();
            this.renderNoteList();
        }
    }

    renderEditor() {
        if (!this.currentNote) return;
        document.getElementById('noteTitle').value = this.currentNote.title;
        document.getElementById('noteContent').value = this.currentNote.content;
        document.getElementById('toggleStar').textContent = this.currentNote.starred ? '⭐' : '☆';
        this.updateWordCount();
        this.updateLastSaved();
    }

    autoSave() {
        if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => this.saveCurrentNote(), 1000);
    }

    async saveCurrentNote() {
        if (!this.currentNote) return;
        this.currentNote.title = document.getElementById('noteTitle').value;
        this.currentNote.content = document.getElementById('noteContent').value;
        this.currentNote.updatedAt = new Date().toISOString();
        await storage.update(this.currentNote);
        this.updateLastSaved();
        this.renderNoteList();
    }

    updateLastSaved() {
        const now = new Date();
        document.getElementById('lastSaved').textContent = `已保存 ${now.toLocaleTimeString('zh-CN')}`;
    }

    updateWordCount() {
        const content = document.getElementById('noteContent').value;
        const count = content.length;
        document.getElementById('wordCount').textContent = `${count} 字`;
    }

    togglePreview() {
        const content = document.getElementById('noteContent');
        const preview = document.getElementById('preview');
        if (preview.classList.contains('hidden')) {
            preview.innerHTML = markdown.parse(content.value);
            preview.classList.remove('hidden');
            content.classList.add('hidden');
        } else {
            preview.classList.add('hidden');
            content.classList.remove('hidden');
        }
    }

    async toggleStar() {
        if (!this.currentNote) return;
        this.currentNote.starred = !this.currentNote.starred;
        await storage.update(this.currentNote);
        this.renderEditor();
        this.renderNoteList();
    }

    async deleteNote() {
        if (!this.currentNote) return;
        if (this.currentNote.deleted) {
            // 永久删除
            if (confirm('确定要永久删除这篇笔记吗？')) {
                await storage.delete(this.currentNote.id);
            }
        } else {
            // 移入回收站
            this.currentNote.deleted = true;
            this.currentNote.updatedAt = new Date().toISOString();
            await storage.update(this.currentNote);
        }
        this.currentNote = null;
        this.renderEditor();
        this.renderNoteList();
    }

    exportNote() {
        if (!this.currentNote) return;
        const blob = new Blob([this.currentNote.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentNote.title || 'untitled'}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async renderNoteList() {
        let notes = [];
        if (this.filter === 'all') {
            notes = await storage.getActive();
        } else if (this.filter === 'starred') {
            notes = await storage.getStarred();
        } else if (this.filter === 'trash') {
            notes = await storage.getDeleted();
        }

        if (this.searchQuery) {
            const lower = this.searchQuery.toLowerCase();
            notes = notes.filter(n => 
                n.title.toLowerCase().includes(lower) || 
                n.content.toLowerCase().includes(lower)
            );
        }

        // 按更新时间排序
        notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        const listEl = document.getElementById('noteList');
        listEl.innerHTML = notes.map(note => {
            const preview = note.content.replace(/[#*`\[\]()]|</g, '').substring(0, 50);
            const date = new Date(note.updatedAt).toLocaleDateString('zh-CN');
            const active = this.currentNote && this.currentNote.id === note.id ? 'active' : '';
            return `
                <div class="note-item ${active}" onclick="app.loadNote('${note.id}')">
                    <div class="note-title">${note.title || '无标题'}</div>
                    <div class="note-preview">${preview || '空笔记'}</div>
                    <div class="note-date">${date}</div>
                </div>
            `;
        }).join('');
    }
}

// 初始化应用
window.app = new NotesApp();
