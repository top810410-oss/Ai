import React, { useState, useEffect, useRef } from "react";
import { Project, ChatMessage, AppSpecification } from "../types";
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Eye, 
  Database, 
  Code, 
  Download, 
  Copy, 
  Check, 
  Server, 
  ShieldCheck, 
  ChevronRight, 
  FileCode2 
} from "lucide-react";
import AppPreview from "./AppPreview";
import DatabaseConsole from "./DatabaseConsole";

interface AppStudioProps {
  project: Project;
  onBack: () => void;
  onUpdateProjectSpec: (spec: AppSpecification) => void;
  onUpdateProjectRows: (tableName: string, rows: any[]) => void;
}

export default function AppStudio({ project, onBack, onUpdateProjectSpec, onUpdateProjectRows }: AppStudioProps) {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"preview" | "database" | "code" | "settings">("preview");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [loadingPatch, setLoadingPatch] = useState<boolean>(false);
  const [patchLogs, setPatchLogs] = useState<string[]>(["空間已同步。", "數據庫沙盒已就緒。"]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [activeCodeFile, setActiveCodeFile] = useState<string>("schema.sql");
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize localized chat on mount or project load
  useEffect(() => {
    setChatMessages([
      {
        id: "m-1",
        sender: "hercules",
        content: `哈囉！我已經為您建構完成符合藍圖需求的 **${project.name}** 了。\n\n現在您可以前往 **即時預覽** 分頁試用操作，或是切換到 **數據庫主控台** 以像 Excel 試算表般直接增刪改您的種子數據！\n\n另外，您可以在左下角的對話框輸入您的修改需求（例如：「新增一個『緊急程度』欄位」、「幫我的看板指標改名」、「主題顏色改為紫色調」），我會立刻重新編譯您的應用程式。`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, [project.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle refinement/patch compilation
  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || loadingPatch) return;

    const userMsg: ChatMessage = {
      id: `m-u-${Date.now()}`,
      sender: "user",
      content: feedbackText,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const originalFeedback = feedbackText;
    setFeedbackText("");
    setLoadingPatch(true);
    setPatchLogs(["啟動規格修補編譯器...", "正在讀取現有資料表關聯與狀態結構..."]);

    try {
      const response = await fetch("/api/patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSpec: project.spec,
          feedback: originalFeedback,
          chatHistory: chatMessages.slice(-5)
        })
      });

      const data = await response.json();
      if (data.logs) {
        setPatchLogs(prev => [...prev, ...data.logs]);
      }

      if (data.appSpec) {
        onUpdateProjectSpec(data.appSpec);
        
        // Add Hercules reply
        const botReply: ChatMessage = {
          id: `m-h-${Date.now()}`,
          sender: "hercules",
          content: `我已成功編譯並更新了您的應用系統規格！以下是修補後的系統屬性摘要：\n\n* **系統名稱**: ${data.appSpec.appName}\n* **主題顏色**: ${data.appSpec.theme?.primaryColor || "藍靛色"}\n* **開發備註**: ${data.appSpec.developerNotes || "已調整並重新計算約束關係。"}\n\n所有變更已在 Staging 暫存模式中編譯並同步部署。`,
          timestamp: new Date().toLocaleTimeString()
        };
        setChatMessages(prev => [...prev, botReply]);
        setPatchLogs(prev => [...prev, "系統規格修補成功，沙盒已同步載入！"]);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setPatchLogs(prev => [...prev, `補丁編譯失敗: ${err.message || err}`]);
      setChatMessages(prev => [
        ...prev,
        {
          id: `m-e-${Date.now()}`,
          sender: "system",
          content: `無法編譯修補指令: "${err.message || err}"。請檢查您的參數與語法再試一次。`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoadingPatch(false);
    }
  };

  // Virtual files compiled based on appSpec
  const virtualFiles = {
    "schema.sql": `-- 針對 ${project.spec.appName} 生成的動態關聯式 SQL DDL 架構
${project.spec.databaseSchema.tables.map(table => {
  const colsSql = table.columns.map(col => {
    let typeSql = "VARCHAR(255)";
    if (col.type === "number") typeSql = "INTEGER";
    if (col.type === "boolean") typeSql = "BOOLEAN DEFAULT FALSE";
    if (col.type === "date") typeSql = "DATE";
    return `  ${col.name} ${typeSql}${col.isPrimaryKey ? " PRIMARY KEY" : ""}`;
  }).join(",\n");
  
  const seedSql = table.seedData.map(row => {
    const keys = Object.keys(row).join(", ");
    const vals = Object.values(row).map(v => typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : v).join(", ");
    return `INSERT INTO ${table.tableName} (${keys}) VALUES (${vals});`;
  }).join("\n");

  return `CREATE TABLE ${table.tableName} (\n${colsSql}\n);\n\n-- 資料表 ${table.tableName.toUpperCase()} 預設種子數據\n${seedSql}\n`;
}).join("\n")}`,

    "appspec.json": JSON.stringify(project.spec, null, 2),

    "api-client.ts": `// 自動生成的關聯式沙盒 CRUD 端點連接器
import axios from 'axios';

export interface DatabaseRecord {
  id: string;
  [key: string]: any;
}

/**
 * 從 Hercules 雲端關聯數據虛擬沙盒同步取得資料列
 */
export async function fetchTableRows(tableName: string): Promise<DatabaseRecord[]> {
  const response = await axios.get(\`/api/v1/database/tables/\${tableName}/rows\`);
  return response.data.rows;
}

/**
 * 寫入新紀錄至指定資料表並即時重算統計指標
 */
export async function insertRow(tableName: string, payload: Record<string, any>): Promise<DatabaseRecord> {
  const response = await axios.post(\`/api/v1/database/tables/\${tableName}/insert\`, payload);
  return response.data.record;
}

/**
 * 更新單個儲存格或整列數值
 */
export async function updateRow(tableName: string, rowId: string, updates: Record<string, any>): Promise<void> {
  await axios.patch(\`/api/v1/database/tables/\${tableName}/rows/\${rowId}\`, updates);
}
`,

    "README.md": `# 已編譯完成之應用系統: ${project.spec.appName}

${project.spec.appDescription}

## AI 開發者備註詳情
${project.spec.developerNotes || "暫無啟用備註。"}

## 自動生成並載入的關聯式資料表
${project.spec.databaseSchema.tables.map(table => `- **${table.label}** (\`${table.tableName}\`): 定義了 ${table.columns.length} 個標準欄位`).join("\n")}

本系統已經過優化，並部署於本地 Staging 仿真沙盒中運作。
`
  };

  const handleCopyCode = () => {
    const codeText = virtualFiles[activeCodeFile as keyof typeof virtualFiles] || "";
    navigator.clipboard.writeText(codeText);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans" id="studio-workspace">
      {/* Dynamic Staging App Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 flex-shrink-0" id="studio-header">
        <div className="flex items-center gap-4">
          <button
            id="back-dashboard-btn"
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-100"
            title="返回專案主控制台"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-slate-800"></div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-bold">
                AUTOPILOT STUDIO
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
                沙盒運作中
              </span>
            </div>
            <h1 className="text-base font-black text-white mt-1 leading-none tracking-tight">{project.name} 系統工作區</h1>
          </div>
        </div>

        {/* Dynamic Studio Tabs Selector */}
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl" id="studio-tab-bar">
            <button
              id="studio-tab-preview"
              onClick={() => setActiveWorkspaceTab("preview")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeWorkspaceTab === "preview"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-4 h-4" />
              即時預覽
            </button>
            <button
              id="studio-tab-database"
              onClick={() => setActiveWorkspaceTab("database")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeWorkspaceTab === "database"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-4 h-4" />
              數據庫主控台
            </button>
            <button
              id="studio-tab-code"
              onClick={() => setActiveWorkspaceTab("code")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeWorkspaceTab === "code"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code className="w-4 h-4" />
              已編譯代碼
            </button>
          </div>

          {/* Quick theme selectors */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {["indigo", "emerald", "violet", "amber", "rose", "sky", "slate"].map((col) => (
              <button
                key={col}
                id={`studio-color-theme-${col}`}
                onClick={() => {
                  onUpdateProjectSpec({
                    ...project.spec,
                    theme: { ...project.spec.theme, primaryColor: col as any }
                  });
                }}
                className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 ${
                  project.spec.theme?.primaryColor === col ? "border-white scale-110" : "border-transparent"
                } ${
                  col === "indigo" ? "bg-indigo-500" :
                  col === "emerald" ? "bg-emerald-500" :
                  col === "violet" ? "bg-violet-500" :
                  col === "amber" ? "bg-amber-500" :
                  col === "rose" ? "bg-rose-500" :
                  col === "sky" ? "bg-sky-500" : "bg-slate-500"
                }`}
                title={`將系統色調更新為 ${col}`}
              ></button>
            ))}
          </div>
        </div>
      </header>

      {/* Workspace Main Body Split Grid */}
      <div className="flex-1 flex overflow-hidden" id="workspace-grid">
        {/* Left Hand: AI Chat refined controller panel */}
        <aside className="w-80 border-r border-slate-800 bg-slate-950 flex flex-col h-full flex-shrink-0" id="chat-sidebar">
          {/* Chat log header */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">AI 協作工作室</span>
          </div>

          {/* Scrolling Chat log messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans" id="chat-history-scroller">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 mb-1">
                  <span>{msg.sender === "user" ? "我" : "Hercules 自動編譯助教"}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div 
                  className={`text-xs px-3.5 py-2.5 rounded-2xl max-w-[95%] whitespace-pre-wrap leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                      : msg.sender === "system"
                      ? "bg-rose-950/40 text-rose-300 border border-rose-900/40 rounded-tl-none font-medium"
                      : "bg-slate-850 border border-slate-800 text-slate-200 rounded-tl-none font-medium"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Autopilot compiling telemetry updates */}
          {loadingPatch && (
            <div className="bg-slate-900 border-t border-slate-800 p-3.5 text-[10px] font-mono text-emerald-400 space-y-1.5" id="chat-telemetry">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span>編譯器分析串流中</span>
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              </div>
              {patchLogs.slice(-2).map((log, lIdx) => (
                <div key={lIdx} className="truncate">&gt; {log}</div>
              ))}
            </div>
          )}

          {/* Feedback Refinement Form */}
          <form onSubmit={handleSendFeedback} className="p-4 border-t border-slate-800 bg-slate-900 flex gap-2" id="chat-form">
            <input
              id="refinement-chat-input"
              type="text"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={loadingPatch ? "正在重新編譯模型約束..." : "告訴 AI 如何修改系統..."}
              className="flex-1 text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500 font-medium"
              disabled={loadingPatch}
            />
            <button
              id="send-refinement-btn"
              type="submit"
              disabled={loadingPatch || !feedbackText.trim()}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                loadingPatch || !feedbackText.trim()
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow animate-pulse-slow"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </aside>

        {/* Center Canvas Workspace Area */}
        <main className="flex-1 p-6 overflow-hidden flex flex-col bg-slate-900" id="main-canvas">
          <div className="flex-1 overflow-hidden" id="active-panel-view">
            {/* VIEW A: LIVE PREVIEW SANDBOX */}
            {activeWorkspaceTab === "preview" && (
              <AppPreview
                spec={project.spec}
                activeRows={project.activeRows}
                onUpdateRows={onUpdateProjectRows}
              />
            )}

            {/* VIEW B: DATABASE CONSOLE */}
            {activeWorkspaceTab === "database" && (
              <DatabaseConsole
                spec={project.spec}
                activeRows={project.activeRows}
                onUpdateRows={onUpdateProjectRows}
              />
            )}

            {/* VIEW C: TECHNICAL SPECS (CODE VISUALIZER) */}
            {activeWorkspaceTab === "code" && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl h-full flex flex-col overflow-hidden animate-fade-in" id="code-tab-container">
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center" id="code-selector">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-300">數據庫關聯清單目錄</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* File Pills */}
                    <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
                      {Object.keys(virtualFiles).map((file) => (
                        <button
                          key={file}
                          id={`code-file-tab-${file}`}
                          onClick={() => {
                            setActiveCodeFile(file);
                            setCopiedFile(false);
                          }}
                          className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg transition-all ${
                            activeCodeFile === file
                              ? "bg-slate-800 text-emerald-400"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {file}
                        </button>
                      ))}
                    </div>

                    {/* Copy action btn */}
                    <button
                      id="copy-code-btn"
                      onClick={handleCopyCode}
                      className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-all"
                    >
                      {copiedFile ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">複製成功！</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>複製代碼</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Preformatted code block */}
                <div className="flex-1 p-5 overflow-auto font-mono text-[11px] text-slate-300 leading-relaxed bg-slate-950 selection:bg-indigo-600/30 whitespace-pre" id="code-block-display">
                  {virtualFiles[activeCodeFile as keyof typeof virtualFiles]}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Hand: Style Guide & Backups panel */}
        <aside className="w-64 border-l border-slate-800 bg-slate-950 hidden xl:flex flex-col h-full p-5 space-y-6 flex-shrink-0 font-sans animate-fade-in" id="design-rail">
          {/* Storage status specs */}
          <div className="space-y-3" id="database-status-rail">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              關聯式儲存
            </h4>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">活躍綱要:</span>
                <span className="text-slate-200 font-mono font-bold uppercase">{project.spec.appName.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">虛擬數據庫:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  SQLite v3.45
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">沙盒資料表數:</span>
                <span className="text-slate-200 font-mono font-bold">{project.spec.databaseSchema.tables.length}</span>
              </div>
            </div>
          </div>

          {/* Relational Quick Docs summary */}
          <div className="space-y-3" id="relations-quick-docs">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              SDK 函式庫映射
            </h4>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3.5 text-xs text-slate-400">
              <p>系統底層正透過高性能模擬引擎執行全自動 CRUD 事務，所有沙盒填報輸入皆即時記錄。</p>
              
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-indigo-400" />
                  <strong className="text-slate-200">動態聚合運算</strong>
                </div>
                <p className="text-[11px] pl-4 text-slate-500">加總、平均與數量統計能根據狀態或優先級分組進行精準的秒級重算。</p>
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-indigo-400" />
                  <strong className="text-slate-200">智慧交互邏輯</strong>
                </div>
                <p className="text-[11px] pl-4 text-slate-500">事件按鈕在點擊時，將自動過濾並更新滿足條件的數據列狀態。</p>
              </div>
            </div>
          </div>

          {/* Advanced Export Center */}
          <div className="space-y-3" id="export-center-rail">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              系統藍圖匯出中心
            </h4>
            
            <div className="space-y-2">
              <button
                id="download-specification-btn"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project.spec, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `${project.name.toLowerCase().replace(/\s+/g, '-')}-spec.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-xs text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-slate-400" />
                匯出 JSON 系統規格
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
