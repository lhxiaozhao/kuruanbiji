// 主应用逻辑
class NotesApp {
    constructor() {
        this.currentNote = null;
        this.filter = 'all';
        this.searchQuery = '';
        this.autoSaveTimer = null;
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    async init() {
        await storage.init();
        this.applyTheme();
        this.bindEvents();
        this.renderNoteList();
        this.createWelcomeNote();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.textContent = this.theme === 'dark' ? '🌙' : '☀️';
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    bindEvents() {
        // 主题切换
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

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
        document.getElementById('saveNote').addEventListener('click', () => this.saveCurrentNote());
        document.getElementById('togglePreview').addEventListener('click', () => this.togglePreview());
        document.getElementById('toggleStar').addEventListener('click', () => this.toggleStar());
        document.getElementById('deleteNote').addEventListener('click', () => this.deleteNote());
        document.getElementById('exportNote').addEventListener('click', () => this.exportNote());
        document.getElementById('importNote').addEventListener('click', () => this.importNote());
        document.getElementById('printNote').addEventListener('click', () => this.printNote());
        document.getElementById('shareNote').addEventListener('click', () => this.shareNote());

        // 工具栏事件
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.insertMarkdown(e.target.dataset.command));
        });

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
                } else if (e.key === 'p') {
                    e.preventDefault();
                    this.printNote();
                }
            }
        });

        // 页面卸载前保存
        window.addEventListener('beforeunload', () => {
            if (this.currentNote) {
                this.saveCurrentNote();
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

- ✅ **Markdown 编辑**：支持标题、列表、代码块、表格、任务列表、脚注等
- ✅ **实时预览**：点击预览按钮查看渲染效果
- ✅ **本地存储**：数据保存在浏览器 IndexedDB，安全可靠
- ✅ **离线可用**：支持 PWA，离线也能使用
- ✅ **搜索功能**：快速查找历史笔记
- ✅ **收藏功能**：标记重要笔记
- ✅ **导出功能**：支持导出为 Markdown 文件
- ✅ **导入功能**：支持导入 Markdown 文件
- ✅ **回收站**：误删笔记可恢复
- ✅ **暗色/亮色主题**：一键切换
- ✅ **打印功能**：支持打印笔记
- ✅ **分享功能**：复制笔记链接

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl + S | 保存笔记 |
| Ctrl + N | 新建笔记 |
| Ctrl + F | 搜索笔记 |
| Ctrl + P | 打印笔记 |

## Markdown 语法示例

### 文本格式

**粗体文字** 和 *斜体文字* 和 ~~删除线~~

### 任务列表

- [ ] 待办事项 1
- [x] 已完成事项 2
- [ ] 待办事项 3

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

### 脚注

这是一个带有脚注的文本[^1]

[^1]: 这是脚注内容

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

    async createNewNote() {
        // 先保存当前笔记
        if (this.currentNote) {
            await this.saveCurrentNote();
        }
        
        const note = {
            id: this.generateId(),
            title: '',
            content: '',
            starred: false,
            deleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await storage.add(note);
        this.currentNote = note;
        this.renderEditor();
        this.renderNoteList();
        document.getElementById('noteTitle').focus();
    }

    async loadNote(id) {
        // 先保存当前笔记
        if (this.currentNote) {
            await this.saveCurrentNote();
        }
        
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
        this.renderTags();
    }

    autoSave() {
        if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => this.saveCurrentNote(), 500);
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

    renderTags() {
        const tagsEl = document.getElementById('noteTags');
        if (!this.currentNote || !this.currentNote.tags) {
            tagsEl.innerHTML = '';
            return;
        }
        tagsEl.innerHTML = this.currentNote.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
    }

    insertMarkdown(command) {
        const textarea = document.getElementById('noteContent');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        let insertion = '';
        let cursorOffset = 0;

        switch(command) {
            case 'bold':
                insertion = `**${selectedText || '粗体'}**`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'italic':
                insertion = `*${selectedText || '斜体'}*`;
                cursorOffset = selectedText ? 0 : -1;
                break;
            case 'underline':
                insertion = `<u>${selectedText || '下划线'}</u>`;
                cursorOffset = selectedText ? 0 : -4;
                break;
            case 'strikethrough':
                insertion = `~~${selectedText || '删除线'}~~`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'h1':
                insertion = `\n# ${selectedText || '标题1'}`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'h2':
                insertion = `\n## ${selectedText || '标题2'}`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'h3':
                insertion = `\n### ${selectedText || '标题3'}`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'ul':
                insertion = `\n- ${selectedText || '列表项'}`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'ol':
                insertion = `\n1. ${selectedText || '列表项'}`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'check':
                insertion = `\n- [ ] ${selectedText || '待办事项'}`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'code':
                insertion = `\n\`\`\`\n${selectedText || '代码'}\n\`\`\`\n`;
                cursorOffset = selectedText ? 0 : -6;
                break;
            case 'quote':
                insertion = `\n> ${selectedText || '引用'}`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'link':
                insertion = `[${selectedText || '链接文本'}](url)`;
                cursorOffset = selectedText ? 0 : -5;
                break;
            case 'image':
                insertion = `![${selectedText || '图片描述'}](url)`;
                cursorOffset = selectedText ? 0 : -5;
                break;
            case 'table':
                insertion = `\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n`;
                cursorOffset = -2;
                break;
            case 'hr':
                insertion = `\n---\n`;
                cursorOffset = -2;
                break;
        }

        textarea.value = text.substring(0, start) + insertion + text.substring(end);
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + insertion.length + cursorOffset;
        this.autoSave();
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

    async importNote() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,.txt';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            const note = {
                id: this.generateId(),
                title: file.name.replace(/\.[^/.]+$/, ''),
                content: text,
                starred: false,
                deleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await storage.add(note);
            this.currentNote = note;
            this.renderEditor();
            this.renderNoteList();
        };
        input.click();
    }

    printNote() {
        if (!this.currentNote) return;
        // 先显示预览
        const preview = document.getElementById('preview');
        const content = document.getElementById('noteContent');
        if (preview.classList.contains('hidden')) {
            preview.innerHTML = markdown.parse(content.value);
            preview.classList.remove('hidden');
            content.classList.add('hidden');
        }
        // 打印
        window.print();
    }

    shareNote() {
        if (!this.currentNote) return;
        // 复制笔记内容到剪贴板
        const text = `# ${this.currentNote.title}\n\n${this.currentNote.content}`;
        navigator.clipboard.writeText(text).then(() => {
            alert('笔记内容已复制到剪贴板！');
        }).catch(() => {
            alert('复制失败，请手动复制');
        });
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
            const tags = note.tags ? note.tags.map(t => `<span class="tag">${t}</span>`).join('') : '';
            return `
                <div class="note-item ${active}" onclick="app.loadNote('${note.id}')">
                    <div class="note-title">${note.title || '无标题'}</div>
                    ${tags ? `<div class="note-tags">${tags}</div>` : ''}
                    <div class="note-preview">${preview || '空笔记'}</div>
                    <div class="note-date">${date}</div>
                </div>
            `;
        }).join('');
    }
}

// 初始化应用
window.app = new NotesApp();
