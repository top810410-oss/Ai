# 階段一：編譯階段 (使用完整 Node.js 20 映像檔，避免缺少系統建置工具)
FROM node:20 AS builder

WORKDIR /app

# 複製依賴宣告並安裝
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 複製專案代碼
COPY . .

# 設定環境變數為生產模式並執行建置 (Vite 靜態資源 + Express 伺服器打包)
ENV NODE_ENV=production
RUN npm run build

# 階段二：生產環境運行 (使用完整 Node.js 20 映像檔，確保運行時環境完全一致)
FROM node:20 AS runner

WORKDIR /app

# 僅安裝生產環境所需的套件 (排除開發依賴，使用現代的 --omit=dev)
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# 從編譯階段複製建置成果
COPY --from=builder /app/dist ./dist

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=3000

# 曝露服務連接埠
EXPOSE 3000

# 啟動專案
CMD ["node", "dist/server.cjs"]
