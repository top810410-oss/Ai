import React, { useState, useMemo } from "react";
import { AppSpecification } from "../types";
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  LineChart, 
  Plus, 
  Trash2, 
  Check, 
  TrendingUp, 
  Sparkles, 
  AlertCircle 
} from "lucide-react";

interface AppPreviewProps {
  spec: AppSpecification;
  activeRows: Record<string, any[]>;
  onUpdateRows: (tableName: string, rows: any[]) => void;
}

export default function AppPreview({ spec, activeRows, onUpdateRows }: AppPreviewProps) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Style helper mapping primary colors
  const colorMap = useMemo(() => {
    const primary = spec.theme?.primaryColor || "indigo";
    
    const colorClasses: Record<string, {
      bg: string;
      bgHover: string;
      text: string;
      border: string;
      ring: string;
      accentBg: string;
      accentText: string;
      lightBg: string;
      gradient: string;
    }> = {
      indigo: {
        bg: "bg-indigo-600",
        bgHover: "hover:bg-indigo-700",
        text: "text-indigo-600",
        border: "border-indigo-500",
        ring: "focus:ring-indigo-500",
        accentBg: "bg-violet-600",
        accentText: "text-violet-600",
        lightBg: "bg-indigo-50/50",
        gradient: "from-indigo-500 to-violet-600"
      },
      emerald: {
        bg: "bg-emerald-600",
        bgHover: "hover:bg-emerald-700",
        text: "text-emerald-600",
        border: "border-emerald-500",
        ring: "focus:ring-emerald-500",
        accentBg: "bg-teal-600",
        accentText: "text-teal-600",
        lightBg: "bg-emerald-50/50",
        gradient: "from-emerald-500 to-teal-600"
      },
      violet: {
        bg: "bg-violet-600",
        bgHover: "hover:bg-violet-700",
        text: "text-violet-600",
        border: "border-violet-500",
        ring: "focus:ring-violet-500",
        accentBg: "bg-fuchsia-600",
        accentText: "text-fuchsia-600",
        lightBg: "bg-violet-50/50",
        gradient: "from-violet-500 to-fuchsia-600"
      },
      amber: {
        bg: "bg-amber-600",
        bgHover: "hover:bg-amber-700",
        text: "text-amber-600",
        border: "border-amber-500",
        ring: "focus:ring-amber-500",
        accentBg: "bg-orange-600",
        accentText: "text-orange-600",
        lightBg: "bg-amber-50/50",
        gradient: "from-amber-500 to-orange-600"
      },
      rose: {
        bg: "bg-rose-600",
        bgHover: "hover:bg-rose-700",
        text: "text-rose-600",
        border: "border-rose-500",
        ring: "focus:ring-rose-500",
        accentBg: "bg-pink-600",
        accentText: "text-pink-600",
        lightBg: "bg-rose-50/50",
        gradient: "from-rose-500 to-pink-600"
      },
      sky: {
        bg: "bg-sky-600",
        bgHover: "hover:bg-sky-700",
        text: "text-sky-600",
        border: "border-sky-500",
        ring: "focus:ring-sky-500",
        accentBg: "bg-blue-600",
        accentText: "text-blue-600",
        lightBg: "bg-sky-50/50",
        gradient: "from-sky-500 to-blue-600"
      },
      slate: {
        bg: "bg-slate-700",
        bgHover: "hover:bg-slate-800",
        text: "text-slate-700",
        border: "border-slate-600",
        ring: "focus:ring-slate-500",
        accentBg: "bg-slate-900",
        accentText: "text-slate-900",
        lightBg: "bg-slate-100",
        gradient: "from-slate-600 to-slate-800"
      }
    };
    return colorClasses[primary] || colorClasses.indigo;
  }, [spec.theme]);

  // Tab Icon Resolver
  const renderTabIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "LayoutDashboard": return <LayoutDashboard className={className} id={`tab-icon-dash`} />;
      case "Database": return <Database className={className} id={`tab-icon-db`} />;
      case "FileText": return <FileText className={className} id={`tab-icon-form`} />;
      case "LineChart": return <LineChart className={className} id={`tab-icon-line`} />;
      default: return <LayoutDashboard className={className} id={`tab-icon-def`} />;
    }
  };

  // Live Query Metric Calculator
  const computedMetrics = useMemo(() => {
    if (!spec.dashboardConfig?.metrics) return [];
    
    return spec.dashboardConfig.metrics.map(metric => {
      const tableRows = activeRows[metric.table] || [];
      
      // Filter rows if specified
      const filteredRows = metric.filterField && metric.filterValue
        ? tableRows.filter(r => String(r[metric.filterField!]).toLowerCase() === String(metric.filterValue).toLowerCase())
        : tableRows;

      let rawVal = 0;
      if (metric.aggregation === "count") {
        rawVal = filteredRows.length;
      } else {
        const fieldKey = metric.field;
        if (fieldKey) {
          const numbers = filteredRows.map(r => Number(r[fieldKey])).filter(v => !isNaN(v));
          if (metric.aggregation === "sum") {
            rawVal = numbers.reduce((a, b) => a + b, 0);
          } else if (metric.aggregation === "avg") {
            rawVal = numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
          }
        }
      }

      // Format output
      let displayValue = String(rawVal);
      if (metric.format === "currency") {
        displayValue = new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(rawVal);
      } else if (metric.format === "percent") {
        displayValue = `${rawVal.toFixed(1)}%`;
      } else if (metric.format === "number") {
        displayValue = new Intl.NumberFormat("zh-TW").format(rawVal);
      }

      return {
        ...metric,
        computedValue: displayValue
      };
    });
  }, [spec.dashboardConfig, activeRows]);

  // Custom Chart Data Aggregator
  const aggregatedChartData = (chart: any) => {
    const rows = activeRows[chart.table] || [];
    const grouped: Record<string, { label: string; rawValue: number; count: number }> = {};

    rows.forEach(row => {
      const groupVal = String(row[chart.groupBy] || "未指定");
      const numVal = chart.valueField ? Number(row[chart.valueField]) : 1;
      const validNum = isNaN(numVal) ? 0 : numVal;

      if (!grouped[groupVal]) {
        grouped[groupVal] = { label: groupVal, rawValue: 0, count: 0 };
      }
      grouped[groupVal].rawValue += validNum;
      grouped[groupVal].count += 1;
    });

    return Object.values(grouped).map(g => {
      let finalValue = g.rawValue;
      if (chart.aggregation === "count") {
        finalValue = g.count;
      } else if (chart.aggregation === "avg") {
        finalValue = g.count > 0 ? g.rawValue / g.count : 0;
      }
      return {
        name: g.label,
        value: Number(finalValue.toFixed(1))
      };
    });
  };

  // Form Field Value Change Handler
  const handleFieldChange = (name: string, val: any) => {
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  // Form Submission Handler (Relational Row insertion)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(false);
    setFormError("");

    const targetTable = spec.formConfig?.targetTable;
    if (!targetTable) {
      setFormError("配置錯誤: 未設定目標資料表。");
      return;
    }

    const tableSchema = spec.databaseSchema.tables.find(t => t.tableName === targetTable);
    if (!tableSchema) {
      setFormError(`數據庫錯誤: 未找到關聯資料表「${targetTable}」。`);
      return;
    }

    // Validate Required Fields and Build Row
    const newRow: Record<string, any> = {
      id: `${targetTable.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`
    };

    for (const field of spec.formConfig.fields) {
      const val = formData[field.name];
      if (field.required && (val === undefined || val === "")) {
        setFormError(`欄位「${field.label}」為必填項目。`);
        return;
      }

      // Coerce field types safely
      if (val !== undefined && val !== "") {
        if (field.controlType === "number") {
          newRow[field.name] = Number(val);
        } else if (field.controlType === "checkbox") {
          newRow[field.name] = Boolean(val);
        } else {
          newRow[field.name] = val;
        }
      } else {
        newRow[field.name] = field.defaultValue !== undefined ? field.defaultValue : "";
      }
    }

    // Insert to Active Row State
    const existingRows = activeRows[targetTable] || [];
    onUpdateRows(targetTable, [...existingRows, newRow]);
    
    // Clear state
    setFormData({});
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  // Delete individual record row
  const handleDeleteRow = (tableName: string, index: number) => {
    const existing = activeRows[tableName] || [];
    const updated = [...existing];
    updated.splice(index, 1);
    onUpdateRows(tableName, updated);
  };

  // Action Button Handler (Relational database mutation)
  const handleActionButton = (btn: any, rowId: string) => {
    const table = btn.targetTable;
    const existing = activeRows[table] || [];
    
    const updated = existing.map(row => {
      if (row.id === rowId) {
        return { ...row, ...btn.updates };
      }
      return row;
    });

    onUpdateRows(table, updated);
  };

  return (
    <div className="w-full bg-slate-950/20 rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full min-h-[500px]" id="app-preview-container">
      {/* Simulated App Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="simulated-header">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${colorMap.bg} animate-pulse`} id="simulated-status"></span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight" id="simulated-app-name">{spec.appName || "動態應用系統"}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1" id="simulated-app-desc">{spec.appDescription || "AI 自動生成之沙盒運作環境"}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto animate-fade-in" id="simulated-navbar">
          {(spec.navigation || []).map((nav) => (
            <button
              key={nav.id}
              id={`nav-btn-${nav.id}`}
              onClick={() => {
                setActiveTab(nav.id);
                setFormSuccess(false);
                setFormError("");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === nav.id
                  ? `bg-white ${colorMap.text} shadow-sm`
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {renderTabIcon(nav.icon, "w-4 h-4")}
              {nav.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Contents */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50" id="simulated-body">
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6" id="preview-tab-dashboard">
            {/* Computed KPIs Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" id="computed-kpis-grid">
              {computedMetrics.length > 0 ? (
                computedMetrics.map((m) => (
                  <div key={m.id} id={`kpi-card-${m.id}`} className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{m.label}</span>
                      <h3 className="text-2xl font-black mt-2 text-slate-800 tracking-tight">{m.computedValue}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${colorMap.lightBg} ${colorMap.text}`}>
                        {m.aggregation === "sum" ? "加總" : m.aggregation === "avg" ? "平均" : "計數"}
                      </span>
                      <span>於資料表 <strong className="text-slate-700">{m.table}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl" id="no-kpi-metrics">
                  尚未設定統計指標。請先於規格中配置指標綁定。
                </div>
              )}
            </div>

            {/* Quick Action Interactive Buttons */}
            {spec.interactiveButtons && spec.interactiveButtons.length > 0 && (
              <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm" id="action-triggers">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className={`w-4 h-4 ${colorMap.text}`} id="action-icon" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">智慧自動化工作流</h4>
                </div>
                <p className="text-xs text-slate-500 mb-4">一鍵對滿足特定篩選約束的資料列執行 AI 配置的狀態轉換規則。</p>
                
                <div className="flex flex-wrap gap-3" id="buttons-group">
                  {spec.interactiveButtons.map((btn) => {
                    const candidateRows = activeRows[btn.targetTable] || [];
                    const matchCount = candidateRows.filter(row => {
                      try {
                        const matches = btn.condition.match(/(\w+)\s*===\s*['"]([^'"]+)['"]/);
                        if (matches) {
                          const [_, field, val] = matches;
                          return row[field] === val;
                        }
                        return true;
                      } catch {
                        return true;
                      }
                    }).length;

                    return (
                      <button
                        key={btn.id}
                        id={`action-btn-${btn.id}`}
                        disabled={matchCount === 0}
                        onClick={() => {
                          candidateRows.forEach(row => {
                            try {
                              const matches = btn.condition.match(/(\w+)\s*===\s*['"]([^'"]+)['"]/);
                              if (matches) {
                                const [_, field, val] = matches;
                                if (row[field] === val) {
                                  handleActionButton(btn, row.id);
                                }
                              } else {
                                handleActionButton(btn, row.id);
                              }
                            } catch {
                              handleActionButton(btn, row.id);
                            }
                          });
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                          matchCount > 0
                            ? `${colorMap.bg} ${colorMap.bgHover} text-white shadow-sm`
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {btn.label} (目前有 {matchCount} 筆項目符合)
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Generated Visual Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans" id="dashboard-charts-grid">
              {(spec.dashboardConfig?.charts || []).map((chart) => {
                const chartData = aggregatedChartData(chart);
                const maxVal = Math.max(...chartData.map(d => d.value), 1);

                return (
                  <div key={chart.id} id={`chart-container-${chart.id}`} className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-sm font-bold text-slate-800 tracking-tight">{chart.title}</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-semibold">
                        {chart.type === "bar" ? "長條圖" : chart.type === "line" ? "折線圖" : "圓餅圖"} • {chart.aggregation === "sum" ? "數值加總" : chart.aggregation === "avg" ? "數值平均" : "筆數統計"}
                      </span>
                    </div>

                    {chartData.length > 0 ? (
                      <div>
                        {chart.type === "bar" && (
                          <div className="space-y-3 pt-2 animate-fade-in" id={`bar-chart-${chart.id}`}>
                            {chartData.map((item, idx) => {
                              const percent = (item.value / maxVal) * 100;
                              return (
                                <div key={idx} className="space-y-1.5">
                                  <div className="flex justify-between text-xs text-slate-600">
                                    <span className="font-medium text-slate-700">{item.name}</span>
                                    <span className="font-bold text-slate-900">
                                      {chart.valueField === "dealValue" || chart.valueField === "purchaseValue"
                                        ? new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(item.value)
                                        : item.value}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-6 rounded-md overflow-hidden relative">
                                    <div 
                                      className={`h-full ${colorMap.bg} transition-all duration-500 ease-out`} 
                                      style={{ width: `${percent}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {chart.type === "line" && (
                          <div className="pt-2 flex flex-col items-center animate-fade-in" id={`line-chart-${chart.id}`}>
                            <svg className="w-full h-40 overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                              <line x1="0" y1="25" x2="400" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                              <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                              <line x1="0" y1="75" x2="400" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                              
                              <path
                                d={chartData.map((item, i) => {
                                  const x = (i / Math.max(chartData.length - 1, 1)) * 400;
                                  const y = 100 - (item.value / maxVal) * 80 - 10;
                                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke={spec.theme.primaryColor === "emerald" ? "#10b981" : spec.theme.primaryColor === "violet" ? "#8b5cf6" : "#6366f1"}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />

                              {chartData.map((item, i) => {
                                const x = (i / Math.max(chartData.length - 1, 1)) * 400;
                                  const y = 100 - (item.value / maxVal) * 80 - 10;
                                return (
                                  <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    className={`fill-white stroke-${spec.theme.primaryColor}-500 stroke-[2.5]`}
                                  />
                                );
                              })}
                            </svg>
                            <div className="flex justify-between w-full mt-2 text-[10px] font-bold text-slate-500 uppercase px-1">
                              {chartData.map((item, i) => (
                                <span key={i} className="truncate max-w-[80px]">{item.name}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {chart.type === "pie" && (
                          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2 animate-fade-in" id={`pie-chart-${chart.id}`}>
                            <div className="relative w-32 h-32">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
                                {(() => {
                                  let cumulativePercent = 0;
                                  const colors = ["stroke-indigo-500", "stroke-emerald-500", "stroke-violet-500", "stroke-amber-500", "stroke-rose-500", "stroke-sky-500", "stroke-slate-400"];
                                  const total = chartData.reduce((a, b) => a + b.value, 0) || 1;

                                  return chartData.map((item, idx) => {
                                    const percent = item.value / total;
                                    const strokeDasharray = `${percent * 100} ${100 - percent * 100}`;
                                    const strokeDashoffset = 100 - cumulativePercent + 25;
                                    cumulativePercent += percent * 100;

                                    return (
                                      <circle
                                        key={idx}
                                        cx="16"
                                        cy="16"
                                        r="15.915"
                                        fill="transparent"
                                        className={`${colors[idx % colors.length]}`}
                                        strokeWidth="5"
                                        strokeDasharray={strokeDasharray}
                                        strokeDashoffset={strokeDashoffset}
                                      />
                                    );
                                  });
                                })()}
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-[10px] shadow-inner">
                                <span className="text-[10px] font-black text-slate-400 tracking-wider">加總</span>
                                <span className="text-sm font-black text-slate-800">
                                  {chartData.reduce((a, b) => a + b.value, 0)}
                                </span>
                              </div>
                            </div>

                            {/* Legends */}
                            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto w-full sm:w-1/2">
                              {chartData.map((item, idx) => {
                                const colors = ["bg-indigo-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-sky-500", "bg-slate-400"];
                                return (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></span>
                                      <span className="text-slate-600 font-medium">{item.name}</span>
                                    </div>
                                    <span className="text-slate-900 font-bold">{item.value}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl" id="empty-chart">
                        於資料表 <strong>{chart.table}</strong> 中尚未找到符合的歷史紀錄。
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: RECORDS LIST */}
        {activeTab === "records" && (
          <div className="space-y-6" id="preview-tab-records">
            {spec.databaseSchema.tables.map((tableSpec) => {
              const rows = activeRows[tableSpec.tableName] || [];

              return (
                <div key={tableSpec.tableName} id={`table-card-${tableSpec.tableName}`} className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden animate-fade-in">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 tracking-tight">{tableSpec.label} 資料列表</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">內存資料表：<strong className="text-slate-600 font-mono">{tableSpec.tableName}</strong></p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${colorMap.lightBg} ${colorMap.text}`}>
                      目前共 {rows.length} 筆資料
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                          {tableSpec.columns.map((col) => (
                            <th key={col.name} className="px-6 py-3">{col.label}</th>
                          ))}
                          <th className="px-6 py-3 text-right">管理操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rows.length > 0 ? (
                          rows.map((row, rIdx) => (
                            <tr key={row.id || rIdx} className="hover:bg-slate-50/50 transition-colors duration-150">
                              {tableSpec.columns.map((col) => {
                                const val = row[col.name];
                                return (
                                  <td key={col.name} className="px-6 py-3 text-slate-700 max-w-[180px] truncate">
                                    {col.type === "boolean" ? (
                                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${val ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                        {val ? "是" : "否"}
                                      </span>
                                    ) : col.type === "number" && (col.name.toLowerCase().includes("value") || col.name.toLowerCase().includes("cost") || col.name.toLowerCase().includes("price") || col.name.toLowerCase().includes("金額")) ? (
                                      new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(val || 0)
                                    ) : (
                                      String(val !== undefined ? val : "")
                                    )}
                                  </td>
                                );
                              })}
                              <td className="px-6 py-3 text-right">
                                <button
                                  id={`delete-row-${tableSpec.tableName}-${rIdx}`}
                                  onClick={() => handleDeleteRow(tableSpec.tableName, rIdx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                                  title="刪除此列"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={tableSpec.columns.length + 1} className="text-center py-8 text-slate-400 font-medium">
                              此資料表目前尚無資料。請在「填報表單」分頁中填寫新增。
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: SUBMIT FORM */}
        {activeTab === "form" && (
          <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-xl shadow-sm p-6 animate-fade-in" id="preview-tab-form">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-base font-bold text-slate-900">{spec.formConfig?.title || "填報新資料"}</h3>
              <p className="text-xs text-slate-500 mt-1">{spec.formConfig?.description || "請在下方填寫數值並提交，系統將即時重算分析儀表板。"}</p>
            </div>

            {formSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-xs font-medium" id="form-success-alert">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>提交成功！數據已寫入內存資料庫並即時重算。</span>
              </div>
            )}

            {formError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-xs font-medium" id="form-error-alert">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {(spec.formConfig?.fields || []).map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    {field.label}
                    {field.required && <span className="text-rose-500">*</span>}
                  </label>

                  {field.controlType === "select" ? (
                    <select
                      id={`form-input-${field.name}`}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      required={field.required}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-150 font-medium"
                    >
                      <option value="">請選擇選項...</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.controlType === "checkbox" ? (
                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id={`form-input-${field.name}`}
                        checked={!!formData[field.name]}
                        onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                        className={`w-4 h-4 rounded border-slate-200 text-${spec.theme.primaryColor}-600 focus:ring-${spec.theme.primaryColor}-500`}
                      />
                      <span className="text-xs text-slate-600">{field.placeholder || "啟用此開關"}</span>
                    </div>
                  ) : (
                    <input
                      type={field.controlType === "number" ? "number" : field.controlType === "date" ? "date" : "text"}
                      id={`form-input-${field.name}`}
                      placeholder={field.placeholder || ""}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      required={field.required}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-150 font-medium"
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                id="form-submit-btn"
                className={`w-full py-3 mt-4 text-xs font-bold text-white rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm ${colorMap.bg} ${colorMap.bgHover}`}
              >
                <Plus className="w-4 h-4" />
                寫入資料庫
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: ANALYTICS DETAIL */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fade-in" id="preview-tab-analytics">
            <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 tracking-tight">系統自動化代碼編譯報告</h3>
                <p className="text-xs text-slate-500 mt-1">在此查閱為該系統沙盒所生成的數據庫 DDL 映射關係與核心事件規則。</p>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md">
                智能診斷與監控
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Relational Table Schema Spec */}
              <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">數據庫欄位對應規範</h4>
                <div className="space-y-3">
                  {spec.databaseSchema.tables.map((table) => (
                    <div key={table.tableName} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">{table.label} ({table.tableName})</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-6">
                        {table.columns.map((col) => (
                          <div key={col.name} className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[10px]">
                            <p className="font-bold text-slate-700 truncate">{col.label}</p>
                            <p className="font-mono text-slate-400 mt-0.5">{col.name}: {col.type}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer Manifest */}
              <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">AI 開發者日誌</h4>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-xs font-mono text-slate-600 max-h-48 overflow-y-auto whitespace-pre-line">
                    {spec.developerNotes || "暫無建構日誌。"}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-400 text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>數據統計與內存沙盒即時同步，並執行關聯約束重算。</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
