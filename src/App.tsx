import React, { useState, useEffect } from "react";
import { Project, AppSpecification } from "./types";
import Dashboard from "./components/Dashboard";
import AppStudio from "./components/AppStudio";
import { Layers } from "lucide-react";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [compilerLogs, setCompilerLogs] = useState<string[]>([]);

  // Load projects from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hercules_projects");
      if (stored) {
        setProjects(JSON.parse(stored));
      } else {
        // Seed default template project in Traditional Chinese for a breathtaking initial experience
        const defaultProjects: Project[] = [
          {
            id: "p-apex-crm",
            name: "Apex 銷售 CRM 系統",
            prompt: "管理銷售機會與客戶管線、交易金額統計，並支援優先等級排序的個人化 CRM 系統",
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            activeRows: {
              leads: [
                { id: "L-101", company: "以太科技實業", contactName: "張美玲", email: "sarah@aether.io", status: "提案中", dealValue: 45000, priority: "高", lastUpdated: "2026-07-10" },
                { id: "L-102", company: "螺旋生物製藥", contactName: "林志強", email: "m.vance@helix.com", status: "談判中", dealValue: 120000, priority: "高", lastUpdated: "2026-07-12" },
                { id: "L-103", company: "星雲軟體系統", contactName: "陳俊宏", email: "elena@nebula.net", status: "已聯繫", dealValue: 28000, priority: "中", lastUpdated: "2026-07-05" },
                { id: "L-104", company: "泰坦重工集團", contactName: "黃建國", email: "b.miller@titan.org", status: "新機會", dealValue: 15000, priority: "低", lastUpdated: "2026-07-11" },
                { id: "L-105", company: "三稜創意設計", contactName: "賴佳瑩", email: "chloe@prism.design", status: "已贏得", dealValue: 62000, priority: "中", lastUpdated: "2026-07-09" }
              ]
            },
            spec: {
              appName: "Apex 銷售 CRM 系統",
              appDescription: "專為高效率銷售團隊設計的現代化銷售漏斗與潛在客戶評分中心。",
              theme: {
                primaryColor: "indigo",
                accentColor: "violet",
                variant: "glassmorphism"
              },
              navigation: [
                { "id": "dashboard", "label": "漏斗看板", "icon": "LayoutDashboard" },
                { "id": "records", "label": "客戶資料庫", "icon": "Database" },
                { "id": "form", "label": "登錄新交易", "icon": "FileText" },
                { "id": "analytics", "label": "銷售分析", "icon": "LineChart" }
              ],
              databaseSchema: {
                tables: [
                  {
                    tableName: "leads",
                    label: "活躍交易機會",
                    columns: [
                      { name: "id", type: "string", label: "客戶編號", isPrimaryKey: true },
                      { name: "company", type: "string", label: "公司名稱" },
                      { name: "contactName", type: "string", label: "聯絡人姓名" },
                      { name: "email", type: "string", label: "電子郵件" },
                      { name: "status", type: "string", label: "交易狀態", options: ["新機會", "已聯繫", "提案中", "談判中", "已贏得", "已流失"] },
                      { name: "dealValue", type: "number", label: "預估金額 ($)" },
                      { name: "priority", type: "string", label: "優先等級", options: ["低", "中", "高"] },
                      { name: "lastUpdated", type: "date", label: "最後跟進日期" }
                    ],
                    seedData: [
                      { id: "L-101", company: "以太科技實業", contactName: "張美玲", email: "sarah@aether.io", status: "提案中", dealValue: 45000, priority: "高", lastUpdated: "2026-07-10" },
                      { id: "L-102", company: "螺旋生物製藥", contactName: "林志強", email: "m.vance@helix.com", status: "談判中", dealValue: 120000, priority: "高", lastUpdated: "2026-07-12" },
                      { id: "L-103", company: "星雲軟體系統", contactName: "陳俊宏", email: "elena@nebula.net", status: "已聯繫", dealValue: 28000, priority: "中", lastUpdated: "2026-07-05" },
                      { id: "L-104", company: "泰坦重工集團", contactName: "黃建國", email: "b.miller@titan.org", status: "新機會", dealValue: 15000, priority: "低", lastUpdated: "2026-07-11" },
                      { id: "L-105", company: "三稜創意設計", contactName: "賴佳瑩", email: "chloe@prism.design", status: "已贏得", dealValue: 62000, priority: "中", lastUpdated: "2026-07-09" }
                    ]
                  }
                ]
              },
              dashboardConfig: {
                metrics: [
                  { id: "m1", label: "銷售漏斗總估值", table: "leads", field: "dealValue", aggregation: "sum", format: "currency" },
                  { id: "m2", label: "累計潛在客戶數", table: "leads", aggregation: "count", format: "number" },
                  { id: "m3", label: "平均交易機會金額", table: "leads", field: "dealValue", aggregation: "avg", format: "currency" },
                  { id: "m4", label: "已贏得合約金額", table: "leads", field: "dealValue", aggregation: "sum", filterField: "status", filterValue: "已贏得", format: "currency" }
                ],
                charts: [
                  {
                    id: "c1",
                    title: "各狀態階段營收機會分佈",
                    type: "bar",
                    table: "leads",
                    groupBy: "status",
                    valueField: "dealValue",
                    aggregation: "sum",
                    xAxisLabel: "交易狀態",
                    yAxisLabel: "加總金額 ($)"
                  },
                  {
                    id: "c2",
                    title: "潛在客戶優先級別佔比",
                    type: "pie",
                    table: "leads",
                    groupBy: "priority",
                    aggregation: "count"
                  }
                ]
              },
              formConfig: {
                title: "登錄新交易機會",
                description: "提交表單資訊以建立新的活躍管道項目，系統將即時更新數據分析看板。",
                targetTable: "leads",
                fields: [
                  { name: "company", controlType: "text", label: "公司名稱", placeholder: "例如：頂尖企業股份有限公司", required: true },
                  { name: "contactName", controlType: "text", label: "聯絡人姓名", placeholder: "例如：王小明", required: true },
                  { name: "email", controlType: "text", label: "聯絡信箱", placeholder: "例如：service@apex.com", required: true },
                  { name: "status", controlType: "select", label: "初始階段狀態", options: ["新機會", "已聯繫", "提案中", "談判中", "已贏得", "已流失"], defaultValue: "新機會", required: true },
                  { name: "dealValue", controlType: "number", label: "估算成交金額 ($)", placeholder: "例如：25000", defaultValue: 5000, required: true },
                  { name: "priority", controlType: "select", label: "優先等級評估", options: ["低", "中", "高"], defaultValue: "中", required: true },
                  { name: "lastUpdated", controlType: "date", label: "本次跟進日期", required: true }
                ]
              },
              interactiveButtons: [
                {
                  id: "b1",
                  label: "自動推進至「已聯繫」",
                  actionDescription: "將「新機會」一鍵升級為「已聯繫」狀態，並同步更新最後跟進日期為今日。",
                  targetTable: "leads",
                  condition: "status === '新機會'",
                  updates: { status: "已聯繫", lastUpdated: "2026-07-12" }
                }
              ],
              developerNotes: "即時編譯完成。在內存客戶端沙盒狀態上實現全關聯式數據庫處理邏輯。"
            }
          }
        ];
        setProjects(defaultProjects);
        localStorage.setItem("hercules_projects", JSON.stringify(defaultProjects));
      }
    } catch (e) {
      console.error("Local storage sync error:", e);
    }
  }, []);

  const syncProjectsToStorage = (updated: Project[]) => {
    setProjects(updated);
    try {
      localStorage.setItem("hercules_projects", JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage save error:", e);
    }
  };

  const handleCreateProject = async (userPrompt: string, presetType?: string) => {
    setLoading(true);
    setCompilerLogs(["正在初始化 Hercules 系統編譯器...", "正在連接後端 API 網關..."]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt, presetType })
      });

      const data = await response.json();
      if (data.logs) {
        setCompilerLogs(prev => [...prev, ...data.logs]);
      }

      if (data.appSpec) {
        const spec: AppSpecification = data.appSpec;
        
        const initialActiveRows: Record<string, any[]> = {};
        spec.databaseSchema.tables.forEach(table => {
          initialActiveRows[table.tableName] = [...table.seedData];
        });

        const newProject: Project = {
          id: `proj-${Date.now()}`,
          name: spec.appName || "自訂 AI 應用系統",
          prompt: userPrompt,
          createdAt: new Date().toISOString(),
          spec,
          activeRows: initialActiveRows
        };

        const updated = [newProject, ...projects];
        syncProjectsToStorage(updated);
        
        setCompilerLogs(prev => [...prev, "系統部署成功！正在引導至 Autopilot Studio 協作空間..."]);
        
        setTimeout(() => {
          setSelectedProjectId(newProject.id);
          setLoading(false);
          setCompilerLogs([]);
        }, 1200);

      } else {
        throw new Error(data.error || "未能產生應用系統的藍圖規格。");
      }
    } catch (err: any) {
      console.error(err);
      setCompilerLogs(prev => [...prev, `編譯器出錯: ${err.message || err}。正在重置狀態...`]);
      setLoading(false);
    }
  };

  const handleUpdateProjectSpec = (updatedSpec: AppSpecification) => {
    if (!selectedProjectId) return;
    const updated = projects.map(proj => {
      if (proj.id === selectedProjectId) {
        const activeRowsMerged = { ...proj.activeRows };
        updatedSpec.databaseSchema.tables.forEach(table => {
          if (!activeRowsMerged[table.tableName]) {
            activeRowsMerged[table.tableName] = [...table.seedData];
          }
        });

        return {
          ...proj,
          name: updatedSpec.appName,
          spec: updatedSpec,
          activeRows: activeRowsMerged
        };
      }
      return proj;
    });
    syncProjectsToStorage(updated);
  };

  const handleUpdateProjectRows = (tableName: string, rows: any[]) => {
    if (!selectedProjectId) return;
    const updated = projects.map(proj => {
      if (proj.id === selectedProjectId) {
        return {
          ...proj,
          activeRows: {
            ...proj.activeRows,
            [tableName]: rows
          }
        };
      }
      return proj;
    });
    syncProjectsToStorage(updated);
  };

  const activeProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="app-root">
      {activeProject ? (
        <AppStudio
          project={activeProject}
          onBack={() => setSelectedProjectId(null)}
          onUpdateProjectSpec={handleUpdateProjectSpec}
          onUpdateProjectRows={handleUpdateProjectRows}
        />
      ) : (
        <div className="flex-1 flex flex-col" id="dashboard-layout">
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0" id="main-header">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/10">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-black text-slate-900 tracking-tight leading-none" id="main-logo-text">Hercules</h1>
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">AI 系統開發與關聯庫沙盒平台</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs" id="engine-status">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-600 font-semibold font-mono">系統狀態: 運作中</span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-8" id="dashboard-main">
            <Dashboard
              projects={projects}
              onCreateProject={handleCreateProject}
              onSelectProject={(id) => setSelectedProjectId(id)}
              loading={loading}
              logs={compilerLogs}
            />
          </main>
        </div>
      )}
    </div>
  );
}
