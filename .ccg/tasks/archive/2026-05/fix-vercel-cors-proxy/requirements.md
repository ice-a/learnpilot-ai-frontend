# 需求增强说明：修复 Vercel 部署后 CORS 失败

## 现象
- 前端域名：https://learn.020417.xyz
- API 域名：https://learn-api.020417.xyz
- 浏览器报错：No Access-Control-Allow-Origin、preflight request doesn't pass

## 目标
- 生产环境前端请求改为同源 /api/v1/*，避免浏览器跨域检查。
- 通过 Vercel rewrite 将 /api/v1/* 转发到真实后端 https://learn-api.020417.xyz/api/v1/*。
- 即使误配了跨域 VITE_API_BASE_URL，生产环境也优先回退到同源路径。

## 验收
- 构建通过。
- 前端请求 URL 显示为同源 /api/v1/*。
- 部署后不再出现 CORS/preflight 拦截。
