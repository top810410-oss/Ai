import React, { useState } from "react";
import { Project } from "../types";
import { 
  Sparkles, 
  Terminal, 
  Database, 
  FileText, 
  PlusCircle, 
  ArrowRight, 
  GitBranch, 
  RefreshCw, 
  Layers, 
  FolderGit2, 
  Cpu 
} from "lucide-react";

interface DashboardProps {
  projects: Project[];
  onCreateProject: (prompt: string, presetType?: string) => void;
  onSelectProject: (id: string) => void;
  loading: boolean;
  logs: string[];
}

export default function Dashboard({ projects, onCreateProject, onSelectProject, loading, logs }: DashboardProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");

  // Sample quick suggestion cards in Traditional Chinese
  const SUGGESTIONS = [
    { text: "個人銷售 CRM 系統，包含潛在客戶評分與交易漏斗統計看板", category: "客戶關係與銷售" },
    { text: "ZenITH 企業設備資產登記簿與維修紀錄監控中心", category: "硬體設備與營運" },
    { text: "企業員工入職引導培訓中心與日常任務追蹤工具", category: "人力資源管理" },
    { text: "不動產物件租售展示目錄與預約諮詢表單系統", category: "房產目錄服務" }
  ];

  // Quick Starter Preset blue prints in Traditional Chinese
  const STARTERS = [
    {
      id: "crm",
      title: "Apex 銷售 CRM 系統",
      desc: "高效率交易日誌、自訂優先級別評估與動態營收管線統計看板。",
      tablesCount: 1,
      themeColor: "from-indigo-500 to-violet-600"
    },
    {
      id: "inventory",
      title: "ZenITH 企業設備資產盤點系統",
      desc: "硬體設備保管追蹤、營運狀態更新、採購成本重新計算與維護紀錄。",
      tablesCount: 1,
      themeColor: "from-emerald-500 to-teal-600"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onCreateProject(prompt);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-4 px-2" id="dashboard-root">
      {/* Visual Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4" id="dashboard-hero">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm" id="hero-badge">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>v2.5 全棧自動編譯引擎已啟動</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none animate-fade-in" id="hero-title">
          用 <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Hercules AI</span> 快速建構自訂應用系統
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-medium" id="hero-desc">
          只需輸入您的業務需求（例如客戶管理、設備盤點或活動追蹤），Hercules 將自動為您編譯數據庫架構、生成高仿真種子數據、設定聚合指標，並部署一個可立即互動的精美系統。
        </p>
      </div>

      {/* Main Core Prompting Engine */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12" id="prompting-matrix">
        <div className="lg:col-span-8 p-6 sm:p-8 space-y-6" id="prompter-left">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" id="prompter-cpu-icon" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">整合式智慧生成控制台</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="prompter-form">
            <div className="relative">
              <textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：幫我做一個高階主管徵才追蹤系統，包含候選人狀態階段、評分、面試官反饋備註，以及徵才漏斗統計圖表..."
                rows={4}
                className="w-full text-sm px-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 resize-none font-medium text-slate-800 placeholder-slate-400"
                disabled={loading}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded">
                  UTF-8 結構映射
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4" id="prompter-actions">
              {/* Model Choice config */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">編譯引擎:</span>
                <select
                  id="model-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="text-xs font-bold text-slate-700 border border-slate-200 bg-white px-2.5 py-1.5 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (自動推薦)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (深度邏輯推理)</option>
                </select>
              </div>

              <button
                type="submit"
                id="compile-submit-btn"
                disabled={loading || !prompt.trim()}
                className={`py-3 px-6 text-xs font-bold text-white rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                  loading || !prompt.trim()
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 hover:scale-[1.02]"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    正在編譯系統藍圖...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    立即啟動 AI 編譯
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Suggestions Pills */}
          <div className="space-y-2.5" id="suggestion-shelf">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">不知道該做什麼？點擊以下靈感直接填入：</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="suggestions-grid">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  id={`suggestion-${idx}`}
                  type="button"
                  onClick={() => setPrompt(s.text)}
                  className="text-left bg-slate-50 hover:bg-indigo-50 border border-slate-100 p-3 rounded-xl transition-all duration-200 hover:border-indigo-100 flex flex-col justify-between"
                >
                  <span className="text-[10px] text-indigo-600 font-bold tracking-wider uppercase">{s.category}</span>
                  <p className="text-xs text-slate-600 font-semibold mt-1 truncate w-full">{s.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compile Live System Console Logs */}
        <div className="lg:col-span-4 bg-slate-900 p-6 flex flex-col h-full border-t lg:border-t-0 lg:border-l border-slate-800" id="prompter-right">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-200">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">編譯器監控日誌</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex-1 font-mono text-[11px] text-slate-300 space-y-2.5 overflow-y-auto max-h-[220px] lg:max-h-none h-48 lg:h-auto" id="compiler-logs">
            {logs.length > 0 ? (
              logs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                  <span className={log.includes("Error") || log.includes("出錯") || log.includes("失敗") ? "text-rose-400" : log.includes("成功") || log.includes("部署") ? "text-emerald-400" : "text-slate-300"}>
                    {log}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center py-10">
                &gt;_ 待命中。在上方輸入需求以執行 AST 關係型架構合成。
              </div>
            )}
          </div>
        </div>
      </div>

      {/* One-click Instant blue print starters */}
      <div className="space-y-4" id="blueprint-starters">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">官方推薦繁體中文範本</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="blueprint-starters-grid">
          {STARTERS.map((s) => (
            <div 
              key={s.id} 
              id={`starter-card-${s.id}`}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">互動沙盒 Staging</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md">一鍵即時啟動</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{s.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.desc}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3 text-slate-500 text-[11px] font-medium">
                  <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5" /> {s.tablesCount} 張關聯表</span>
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> 已預先配置指標儀表</span>
                </div>
                <button
                  id={`starter-spawn-btn-${s.id}`}
                  onClick={() => onCreateProject(s.title, s.id)}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group transition-all"
                >
                  產生沙盒系統
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Workspaces registry */}
      <div className="space-y-4" id="active-workspaces">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">我的活躍系統空間 ({projects.length})</h2>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="projects-grid">
            {projects.map((proj) => (
              <div
                key={proj.id}
                id={`project-card-${proj.id}`}
                onClick={() => onSelectProject(proj.id)}
                className="bg-white border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between animate-fade-in"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">
                      沙盒Staging
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2.5 group-hover:text-indigo-600 transition-colors">{proj.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.spec.appDescription}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5" /> {proj.spec.databaseSchema.tables.length} 張資料表</span>
                    <span className="flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" /> 主分支</span>
                  </div>
                  <span className="text-xs font-black text-indigo-600 group-hover:underline flex items-center gap-1">
                    開啟工作室
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center" id="empty-projects">
            <PlusCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">尚未建立應用系統</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">在上方輸入自訂需求來驅動系統架構自動合成引擎。</p>
          </div>
        )}
      </div>
    </div>
  );
}
