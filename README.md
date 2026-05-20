# 🔧 JSON Toolbox

> JSON 格式化 · 验证 · 压缩 · 对比 · 格式转换 — 纯前端在线工具

## ✨ 功能

| 模块 | 功能 |
|---|---|
| 🎨 **格式化/验证** | JSON 美化排版（缩进 2/4/8/Tab 可选），语法校验，结构分析（类型、键数、节点数） |
| 📦 **压缩** | 去除多余空白，最小化体积，显示压缩前后大小及压缩率 |
| 🔍 **对比** | 左右双栏对比两个 JSON，递归检测新增/删除/修改，差异统计 |
| 🔄 **转换** | JSON ↔ YAML ↔ XML 双向转换 |

## 🛠 技术栈

- 纯 HTML5 + CSS3 + JavaScript
- js-yaml (YAML 解析)
- 浏览器端 `DOMParser` (XML 解析)
- 零服务端依赖

## 🚀 部署

支持 Vercel / Netlify / Cloudflare Pages 等静态托管平台一键部署。

```bash
# Vercel CLI 部署
npx vercel --prod
```

## 🔒 隐私

所有处理在浏览器端完成，**文件不上传服务器**。

## 📄 许可

MIT
