// 增强版 Markdown 解析器
class MarkdownParser {
    constructor() {
        this.footnotes = new Map();
        this.footnoteIndex = 0;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isSafeUrl(url) {
        try {
            // 处理相对路径
            const absolute = url.startsWith('./') || url.startsWith('../') || url.startsWith('/') 
                ? new URL(url, location.origin) 
                : new URL(url);
            const blocked = ['javascript:', 'vbscript:', 'data:', 'blob:'];
            return !blocked.some(p => absolute.protocol.startsWith(p));
        } catch {
            // 无法解析的 URL，拒绝
            return false;
        }
    }

    parseInline(text) {
        let result = text;
        // 行内代码
        result = result.replace(/`([^`]+)`/g, (match, code) => `<code>${this.escapeHtml(code)}</code>`);
        // 粗体
        result = result.replace(/\*\*([^*]+)\*\*/g, (match, text) => `<strong>${text}</strong>`);
        // 斜体
        result = result.replace(/\*([^*]+)\*/g, (match, text) => `<em>${text}</em>`);
        // 删除线
        result = result.replace(/~~([^~]+)~~/g, (match, text) => `<del>${text}</del>`);
        // 链接（安全校验）
        result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            if (!this.isSafeUrl(url)) return this.escapeHtml(match);
            return `<a href="${this.escapeHtml(url)}" target="_blank" rel="noopener">${text}</a>`;
        });
        // 图片（安全校验）
        result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
            if (!this.isSafeUrl(url)) return this.escapeHtml(match);
            return `<img src="${this.escapeHtml(url)}" alt="${this.escapeHtml(alt)}">`;
        });
        // 脚注引用
        result = result.replace(/\[\^([^\]]+)\]/g, (match, id) => {
            if (!this.footnotes.has(id)) {
                this.footnoteIndex++;
                this.footnotes.set(id, this.footnoteIndex);
            }
            return `<sup id="fnref-${this.footnotes.get(id)}"><a href="#fn-${this.footnotes.get(id)}">[${this.footnotes.get(id)}]</a></sup>`;
        });
        return result;
    }

    parse(markdown) {
        if (!markdown) return '';
        this.footnotes.clear();
        this.footnoteIndex = 0;
        let html = markdown;

        // 处理代码块（先处理，避免被其他规则干扰）
        html = html.replace(/^```(\w*)\n([\s\S]*?)```$/gm, (match, lang, code) => {
            return `<pre><code class="language-${lang}">${this.escapeHtml(code)}</code></pre>`;
        });

        // 处理标题
        html = html.replace(/^(#{1-6})\s+(.+)$/gm, (match, level, text) => `<h${level}>${this.parseInline(text)}</h${level}>`);

        // 处理引用
        html = html.replace(/^>\s+(.+)$/gm, (match, text) => `<blockquote>${this.parseInline(text)}</blockquote>`);

        // 处理表格
        html = html.replace(/^\|(.+)\|\n\|[-\s|]+\|\n((?:\|.+\|\n?)*)/gm, (match, header, body) => {
            const headers = header.split('|').map(h => h.trim()).filter(h => h);
            const rows = body.trim().split('\n').map(row => 
                row.split('|').map(c => c.trim()).filter(c => c)
            );
            let tableHtml = '<table><thead><tr>';
            headers.forEach(h => tableHtml += `<th>${this.parseInline(h)}</th>`);
            tableHtml += '</tr></thead><tbody>';
            rows.forEach(row => {
                tableHtml += '<tr>';
                row.forEach(cell => tableHtml += `<td>${this.parseInline(cell)}</td>`);
                tableHtml += '</tr>';
            });
            tableHtml += '</tbody></table>';
            return tableHtml;
        });

        // 处理任务列表
        html = html.replace(/^\s*[-*]\s+\[([ xX])\]\s+(.+)$/gm, (match, checkbox, text) => {
            const checked = checkbox.toLowerCase() === 'x' ? 'checked' : '';
            return `<li class="task-list-item"><input type="checkbox" ${checked} disabled> ${this.parseInline(text)}</li>`;
        });

        // 处理无序列表
        html = html.replace(/^[-*]\s+(?!\[)(.+)$/gm, (match, text) => `<li>${this.parseInline(text)}</li>`);

        // 处理有序列表
        html = html.replace(/^\d+\.\s+(.+)$/gm, (match, text) => `<li>${this.parseInline(text)}</li>`);

        // 处理列表包裹
        html = html.replace(/((?:<li>.*?<\/li>\n?)+)/g, (match) => {
            if (match.includes('task-list-item')) {
                return `<ul class="task-list">${match}</ul>`;
            }
            return `<ul>${match}</ul>`;
        });
        html = html.replace(/<\/ul>\s*<ul>/g, '');

        // 处理分割线
        html = html.replace(/^(---|\*\*\*|___)$/gm, '<hr>');

        // 处理脚注定义
        html = html.replace(/^\[\^([^\]]+)\]:\s+(.+)$/gm, (match, id, text) => {
            const index = this.footnotes.get(id) || ++this.footnoteIndex;
            this.footnotes.set(id, index);
            return `<li id="fn-${index}"><sup><a href="#fnref-${index}">[${index}]</a></sup> ${this.parseInline(text)}</li>`;
        });

        // 处理段落
        html = html.split('\n\n').map(p => {
            if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<blockquote') || 
                p.startsWith('<ul') || p.startsWith('<table') || p.startsWith('<hr') || p.startsWith('<li')) {
                return p;
            }
            return `<p>${this.parseInline(p)}</p>`;
        }).join('\n');

        // 处理脚注列表
        if (this.footnotes.size > 0) {
            let footnotesHtml = '<section class="footnotes"><ol>';
            for (let i = 1; i <= this.footnoteIndex; i++) {
                const fn = document.createElement('div');
                fn.innerHTML = html;
                const li = fn.querySelector(`#fn-${i}`);
                if (li) {
                    footnotesHtml += li.outerHTML;
                }
            }
            footnotesHtml += '</ol></section>';
            html = html.replace(/<li id="fn-\d+">.*?<\/li>/gs, '') + footnotesHtml;
        }

        return html;
    }
}

// 导出全局实例
window.MarkdownParser = MarkdownParser;
window.markdown = new MarkdownParser();
