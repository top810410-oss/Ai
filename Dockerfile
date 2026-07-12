# 使用輕量 Node.js 映像檔
FROM node:20-slim AS builder

WORKDIR /app

# 複製依賴宣告並安裝
COPY package*.json ./
RUN npm ci

# 複製專案代碼
COPY . .

# 設定環境變數為生產模式並執行建置 (Vite 靜態資源 + Express 伺服器打包)
ENV NODE_ENV=production
RUN npm run build

# 階段二：生產環境運行
FROM node:20-slim AS runner

WORKDIR /app

# 僅安裝生產環境所需的套件 (排除開發依賴)
COPY package*.json ./
RUN npm ci --only=production

# 從編譯階段複製建置成果
COPY --from=builder /app/dist ./dist

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=3000

# 曝露服務連接埠
EXPOSE 3000

# 啟動專案
CMD ["node", "dist/server.cjs"]
