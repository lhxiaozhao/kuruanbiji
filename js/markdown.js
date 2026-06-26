// 简易 Markdown 解析器
class MarkdownParser {
    constructor() {
        this.rules = [
            // 标题
            { regex: /^(#{1-6})\s+(.+)$/gm, replace: (match, level, text) => `<h${level}>${this.parseInline(text)}</h${level}>` },
            // 代码块
            { regex: /^```(\w*)\n([\s\S]*?)```$/gm, replace: (match, lang, code) => `<pre><code class="language-${lang}">${this.escapeHtml(code)}</code></pre>` },
            // 行内代码
            { regex: /`([^`]+)`/g, replace: (match, code) => `<code>${this.escapeHtml(code)}</code>` },
            // 粗体
            { regex: /\*\*([^*]+)\*\*/g, replace: (match, text) => `<strong>${this.parseInline(text)}</strong>` },
            // 斜体
            { regex: /\*([^*]+)\*/g, replace: (match, text) => `<em>${this.parseInline(text)}</em>` },
            // 引用
            { regex: /^>\s+(.+)$/gm, replace: (match, text) => `<blockquote>${this.parseInline(text)}</blockquote>` },
            // 无序列表
            { regex: /^-\s+(.+)$/gm, replace: (match, text) => `<li>${this.parseInline(text)}</li>` },
            // 有序列表
            { regex: /^\d+\.\s+(.+)$/gm, replace: (match, text) => `<li>${this.parseInline(text)}</li>` },
            // 链接
            { regex: /\[([^\]]+)\]\(([^)]+)\)/g, replace: (match, text, url) => `<a href="${url}" target="_blank">${this.parseInline(text)}</a>` },
            // 图片
            { regex: /!\[([^\]]*)\]\(([^)]+)\)/g, replace: (match, alt, url) => `<img src="${url}" alt="${alt}">` },
            // 分割线
            { regex: /^---$/gm, replace: () => `<hr>` },
            // 表格
            { regex: /^\|(.+)\|\n\|[-\s|]+\|\n((?:\|.+\|\n?)*)/gm, replace: (match, header, body) => {
                const headers = header.split('|').map(h => h.trim()).filter(h => h);
                const rows = body.trim().split('\n').map(row => 
                    row.split('|').map(c => c.trim()).filter(c => c)
                );
                let html = '<table><thead><tr>';
                headers.forEach(h => html += `<th>${this.parseInline(h)}</th>`);
                html += '</tr></thead><tbody>';
                rows.forEach(row => {
                    html += '<tr>';
                    row.forEach(cell => html += `<td>${this.parseInline(cell)}</td>`);
                    html += '</tr>';
                });
                html += '</tbody></table>';
                return html;
            }}
        ];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    parseInline(text) {
        let result = text;
        // 行内代码
        result = result.replace(/`([^`]+)`/g, (match, code) => `<code>${this.escapeHtml(code)}</code>`);
        // 粗体
        result = result.replace(/\*\*([^*]+)\*\*/g, (match, text) => `<strong>${text}</strong>`);
        // 斜体
        result = result.replace(/\*([^*]+)\*/g, (match, text) => `<em>${text}</em>`);
        // 链接
        result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => `<a href="${url}" target="_blank">${text}</a>`);
        // 图片
        result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => `<img src="${url}" alt="${alt}">`);
        return result;
    }

    parse(markdown) {
        if (!markdown) return '';
        let html = markdown;
        
        // 处理代码块（先处理，避免被其他规则干扰）
        html = html.replace(/^```(\w*)\n([\s\S]*?)```$/gm, (match, lang, code) => {
            return `<pre><code class="language-${lang}">${this.escapeHtml(code)}</code></pre>`;
        });

        // 处理其他规则
        this.rules.forEach(rule => {
            if (rule.regex.source.includes('^```')) return; // 跳过代码块规则
            html = html.replace(rule.regex, rule.replace);
        });

        // 处理列表包裹
        html = html.replace(/(<li>.*?<\/li>)/gs, (match) => `<ul>${match}</ul>`);
        html = html.replace(/<\/ul>\s*<ul>/g, '');

        // 处理段落
        html = html.split('\n\n').map(p => {
            if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<blockquote') || 
                p.startsWith('<ul') || p.startsWith('<table') || p.startsWith('<hr')) {
                return p;
            }
            return `<p>${this.parseInline(p)}</p>`;
        }).join('\n');

        return html;
    }
}

// 导出全局实例
window.MarkdownParser = MarkdownParser;
window.markdown = new MarkdownParser();
