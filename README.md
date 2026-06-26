# 酷软笔记

纯前端 Markdown 笔记应用，数据保存在本地，无需联网即可使用。

## 功能特性

- ✅ **Markdown 编辑**：支持标题、列表、代码块、表格等
- ✅ **实时预览**：点击预览按钮查看渲染效果
- ✅ **本地存储**：数据保存在浏览器 IndexedDB，安全可靠
- ✅ **离线可用**：支持 PWA，离线也能使用
- ✅ **搜索功能**：快速查找历史笔记
- ✅ **收藏功能**：标记重要笔记
- ✅ **导出功能**：支持导出为 Markdown 文件
- ✅ **回收站**：误删笔记可恢复

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl + S | 保存笔记 |
| Ctrl + N | 新建笔记 |
| Ctrl + F | 搜索笔记 |

## 技术栈

- **HTML5**：页面结构
- **CSS3**：样式（暗色主题）
- **JavaScript (ES6+)**：业务逻辑
- **IndexedDB**：本地数据存储
- **Service Worker**：离线缓存
- **PWA**：可安装为桌面应用

## 项目结构

```
notes-app/
├── index.html          # 入口页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── app.js          # 主应用逻辑
│   ├── markdown.js     # Markdown 解析器
│   └── storage.js      # IndexedDB 封装
├── manifest.json       # PWA 配置
└── service-worker.js   # 离线缓存
```

## 使用方法

1. 直接打开 `index.html` 即可使用
2. 或部署到任意静态托管服务（GitHub Pages、Vercel、Netlify 等）
3. 浏览器地址栏会显示安装按钮，可安装为桌面应用

## 部署

### GitHub Pages

```bash
git init
git add .
git commit -m "init"
git remote add origin <your-repo-url>
git push -u origin main
```

然后在 GitHub 仓库设置中启用 GitHub Pages。

### Vercel

```bash
npm i -g vercel
vercel
```

### Netlify

直接将 `notes-app` 文件夹拖拽到 Netlify 网站即可。

## 数据备份

数据保存在浏览器 IndexedDB 中，建议定期导出备份：

1. 点击笔记右上角的 📤 按钮导出为 Markdown 文件
2. 或使用浏览器的开发者工具导出 IndexedDB 数据

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 11.1+
- Edge 79+

## License

MIT
