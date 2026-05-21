# LearnPilot AI Frontend

前端仓库地址：[ice-a/learnpilot-ai-frontend](https://github.com/ice-a/learnpilot-ai-frontend)

后端仓库快速跳转：[ice-a/learnpilot-ai-backend](https://github.com/ice-a/learnpilot-ai-backend)

## 项目说明

LearnPilot AI 的前端应用，包含：

- 登录 / 注册 / 找回密码 / 解锁流程
- 学习计划页（先选方向再进入辅导）
- AI 学习辅导对话页
- 面试辅导页（Markdown + 对话 + 评分 + TTS）
- 个人中心页（个人信息、模型偏好、面试信息）

## 技术栈

- Vue 3 + TypeScript
- Vite
- Pinia
- Vue Router
- Axios

## 本地运行

```bash
npm install
npm run dev
```

默认地址：`http://localhost:5173`

## 后端 API 配置

通过 `.env` 配置：

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api/v1
```

本地开发示例：

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## 脚本

```bash
npm run dev
npm run build
npm run preview
```

## 目录结构

```text
src/
  router/
  services/
  stores/
  views/
  types/
```

## 仓库关联

- Frontend（当前）：[ice-a/learnpilot-ai-frontend](https://github.com/ice-a/learnpilot-ai-frontend)
- Backend：[ice-a/learnpilot-ai-backend](https://github.com/ice-a/learnpilot-ai-backend)

