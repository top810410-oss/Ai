import React, { useState } from "react";
import { AppSpecification } from "../types";
import { Database, Plus, Trash2, Edit, AlertCircle, RefreshCw } from "lucide-react";

interface DatabaseConsoleProps {
  spec: AppSpecification;
  activeRows: Record<string, any[]>;
  onUpdateRows: (tableName: string, rows: any[]) => void;
}

export default function DatabaseConsole({ spec, activeRows, onUpdateRows }: DatabaseConsoleProps) {
  const [selectedTable, setSelectedTable] = useState<string>(
    spec.databaseSchema.tables[0]?.tableName || ""
  );
  const [editCell, setEditCell] = useState<{ rIdx: number; colName: string } | null>(null);
  const [editValue, setEditValue] = useState<any>("");

  // Get active table spec
  const currentTableSpec = spec.databaseSchema.tables.find(
    (t) => t.tableName === selectedTable
  );

  const rows = activeRows[selectedTable] || [];

  // Reset row state back to default seed data
  const handleResetData = () => {
    if (!currentTableSpec) return;
    onUpdateRows(selectedTable, [...currentTableSpec.seedData]);
  };

  // Add empty row
  const handleAddRow = () => {
    if (!currentTableSpec) return;
    const newRow: Record<string, any> = {
      id: `${currentTableSpec.tableName.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`
    };

    currentTableSpec.columns.forEach((col) => {
      if (col.isPrimaryKey) return;
      if (col.type === "number") {
        newRow[col.name] = 0;
      } else if (col.type === "boolean") {
        newRow[col.name] = false;
      } else if (col.type === "date") {
        newRow[col.name] = "2026-07-12";
      } else {
        newRow[col.name] = "";
      }
    });

    onUpdateRows(selectedTable, [...rows, newRow]);
  };

  // Delete row
  const handleDeleteRow = (idx: number) => {
    const updated = [...rows];
    updated.splice(idx, 1);
    onUpdateRows(selectedTable, updated);
  };

  // Cell editing triggers
  const startEditCell = (rIdx: number, colName: string, val: any) => {
    setEditCell({ rIdx, colName });
    setEditValue(val);
  };

  const saveEditCell = (rIdx: number, colName: string) => {
    if (!currentTableSpec) return;
    const updated = [...rows];
    const columnSpec = currentTableSpec.columns.find((c) => c.name === colName);
    
    let coercedVal = editValue;
    if (columnSpec?.type === "number") {
      coercedVal = Number(editValue);
      if (isNaN(coercedVal)) coercedVal = 0;
    } else if (columnSpec?.type === "boolean") {
      coercedVal = editValue === "true" || editValue === true;
    }

    updated[rIdx] = {
      ...updated[rIdx],
      [colName]: coercedVal
    };

    onUpdateRows(selectedTable, updated);
    setEditCell(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full animate-fade-in" id="db-console-root">
      {/* Table Console Header Actions */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50" id="db-console-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">關聯式數據庫管理引擎</h3>
            <p className="text-xs text-slate-500 mt-0.5">直覺、流暢的線上數據表格，支援對虛擬沙盒資料表進行即時 CRUD 增刪改查。</p>
          </div>
        </div>

        {/* Selected Table Picker Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto" id="db-actions">
          <select
            id="table-picker-select"
            value={selectedTable}
            onChange={(e) => {
              setSelectedTable(e.target.value);
              setEditCell(null);
            }}
            className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
          >
            {spec.databaseSchema.tables.map((t) => (
              <option key={t.tableName} value={t.tableName}>
                資料表: {t.label} ({t.tableName})
              </option>
            ))}
          </select>

          <button
            id="reset-seed-btn"
            onClick={handleResetData}
            title="還原為初始種子資料"
            className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            id="add-row-console-btn"
            onClick={handleAddRow}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            新增資料列
          </button>
        </div>
      </div>

      {/* Grid spreadsheet view */}
      {currentTableSpec ? (
        <div className="flex-1 overflow-auto" id="spreadsheet-container">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="px-5 py-3 w-16">#</th>
                {currentTableSpec.columns.map((col) => (
                  <th key={col.name} className="px-5 py-3 min-w-[140px] border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span>{col.label}</span>
                      <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-600 px-1 py-0.5 rounded uppercase">
                        {col.type === "string" ? "字串" : col.type === "number" ? "數值" : col.type === "boolean" ? "布林" : "日期"}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-5 py-3 text-right w-20">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length > 0 ? (
                rows.map((row, rIdx) => (
                  <tr key={row.id || rIdx} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-5 py-3 text-slate-400 font-mono text-[10px] bg-slate-50/40">
                      {rIdx + 1}
                    </td>
                    {currentTableSpec.columns.map((col) => {
                      const val = row[col.name];
                      const isEditing = editCell?.rIdx === rIdx && editCell?.colName === col.name;

                      return (
                        <td 
                          key={col.name} 
                          className="px-5 py-2.5 border-r border-slate-100 relative group-hover:border-slate-200 text-slate-700"
                          onDoubleClick={() => startEditCell(rIdx, col.name, val)}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1" id="editing-cell-form">
                              {col.options ? (
                                <select
                                  id="editing-cell-select"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => saveEditCell(rIdx, col.name)}
                                  className="w-full p-1 border border-indigo-500 rounded bg-white text-xs outline-none font-medium"
                                  autoFocus
                                >
                                  {col.options.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : col.type === "boolean" ? (
                                <select
                                  id="editing-cell-bool"
                                  value={String(editValue)}
                                  onChange={(e) => setEditValue(e.target.value === "true")}
                                  onBlur={() => saveEditCell(rIdx, col.name)}
                                  className="w-full p-1 border border-indigo-500 rounded bg-white text-xs outline-none font-medium"
                                  autoFocus
                                >
                                  <option value="true">是 (True)</option>
                                  <option value="false">否 (False)</option>
                                </select>
                              ) : (
                                <input
                                  id="editing-cell-input"
                                  type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEditCell(rIdx, col.name);
                                    if (e.key === "Escape") setEditCell(null);
                                  }}
                                  onBlur={() => saveEditCell(rIdx, col.name)}
                                  className="w-full p-1 border border-indigo-500 rounded bg-white text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                                  autoFocus
                                />
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group/cell">
                              <span className="truncate max-w-[200px]">
                                {col.type === "boolean" ? (
                                  <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${val ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                    {val ? "是" : "否"}
                                  </span>
                                ) : col.type === "number" && (col.name.toLowerCase().includes("value") || col.name.toLowerCase().includes("cost") || col.name.toLowerCase().includes("price") || col.name.toLowerCase().includes("金額")) ? (
                                  new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(val || 0)
                                ) : (
                                  String(val !== undefined ? val : "")
                                )}
                              </span>
                              <button
                                id={`edit-cell-btn-${rIdx}-${col.name}`}
                                onClick={() => startEditCell(rIdx, col.name, val)}
                                className="opacity-0 group-hover/cell:opacity-100 p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition-all"
                                title="雙擊儲存格亦可直接修改"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-5 py-2.5 text-right">
                      <button
                        id={`delete-console-row-${rIdx}`}
                        onClick={() => handleDeleteRow(rIdx)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="刪除此列"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={currentTableSpec.columns.length + 2} className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                    本資料表目前尚無資料。點擊上方「新增資料列」手動新增一筆。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400" id="empty-db-prompt">
          <AlertCircle className="w-8 h-8 mb-2 text-slate-300" />
          <p className="text-xs font-semibold">未檢測到任何活躍的數據庫結構。</p>
        </div>
      )}

      {/* Database Console Footer Context */}
      <div className="bg-slate-50/80 p-3.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between items-center" id="db-console-footer">
        <span className="flex items-center gap-1.5 font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          已成功連線至本端安全沙盒存儲引擎。
        </span>
        <span>提示：雙擊任何儲存格即可開啟即時編輯。</span>
      </div>
    </div>
  );
}
