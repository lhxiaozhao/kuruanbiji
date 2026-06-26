# 酷软笔记

纯前端 Markdown 笔记应用，数据保存在本地，无需联网即可使用。

## 功能特性

### 编辑与预览
- ✅ **Markdown 编辑**：支持标题、列表、代码块、表格、任务列表、脚注等
- ✅ **三种视图模式**：编辑 / 分屏 / 预览，一键切换
- ✅ **实时预览**：点击预览按钮查看渲染效果
- ✅ **编辑工具栏**：粗体、斜体、下划线、删除线、标题、列表、代码块、引用、链接、图片、表格、分割线

### 笔记管理
- ✅ **本地存储**：数据保存在浏览器 localStorage，安全可靠
- ✅ **离线可用**：支持 PWA，离线也能使用
- ✅ **搜索功能**：快速查找历史笔记
- ✅ **收藏功能**：标记重要笔记
- ✅ **标签系统**：为笔记添加标签，按标签管理
- ✅ **笔记排序**：按修改时间 / 标题 / 创建时间排序
- ✅ **笔记复制**：快速复制笔记
- ✅ **回收站**：误删笔记可恢复

### 导入导出
- ✅ **单篇导出**：支持导出为 Markdown 文件
- ✅ **单篇导入**：支持导入 Markdown 文件
- ✅ **全局备份**：一键导出所有笔记为 JSON
- ✅ **全局恢复**：一键导入备份文件

### 其他功能
- ✅ **暗色/亮色主题**：一键切换
- ✅ **打印功能**：支持打印笔记
- ✅ **分享功能**：复制笔记链接
- ✅ **侧边栏折叠**：最大化编辑空间
- ✅ **字数统计**：实时显示字符数和行数
- ✅ **自动保存**：编辑时自动保存

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl + S | 保存笔记 |
| Ctrl + N | 新建笔记 |
| Ctrl + F | 搜索笔记 |
| Ctrl + P | 打印笔记 |
| Ctrl + E | 切换视图模式 |

## 技术栈

- **HTML5**：页面结构
- **CSS3**：样式（暗色主题）
- **JavaScript (ES6+)**：业务逻辑
- **localStorage**：本地数据存储
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
│   └── storage.js      # localStorage 封装
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

数据保存在浏览器 localStorage 中，建议定期导出备份：

1. 点击侧边栏的 📦 按钮导出所有笔记为 JSON 文件
2. 需要恢复时点击 📂 按钮导入备份文件
3. 单篇笔记可点击 📤 按钮导出为 Markdown 文件

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 11.1+
- Edge 79+

## License

MIT
