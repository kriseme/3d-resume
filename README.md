# 3D 交互式简历

一个基于 Three.js + VRM + GSAP 的浅色 3D 滚动叙事简历网页。

## 本地运行

```bash
npm install
npm run dev
```

## 构建与预览

```bash
npm run build
npm run preview
```

## 修改简历内容

所有文字集中在 `src/data/resume.ts`，修改后全站（侧边栏、首屏、底部完整简历）自动同步。

## 替换 3D 形象

页面默认加载 `public/models/character.glb`（当前为已压缩的 Draco 模型，约 3.8MB；`sample.vrm` 仅作为加载失败时的回退）。

替换成自己的模型：

1. 将 `.glb` 文件放到 `public/models/` 并重命名为 `character.glb`。
2. 如果原文件很大，建议先压缩：简化几何、把贴图缩到 768px、再用 Draco 压缩（可参考 `npx gltf-transform` 工具链）。
3. 重新构建即可。

## 部署到 GitHub Pages

推送到 GitHub 仓库的 `main` 分支后，启用仓库 Settings → Pages → Source 为 GitHub Actions 即可自动部署。

也可手动部署：

```bash
npm run deploy
```
