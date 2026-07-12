export interface Column {
  name: string;
  type: "string" | "number" | "boolean" | "date";
  label: string;
  isPrimaryKey?: boolean;
  options?: string[];
}

export interface Table {
  tableName: string;
  label: string;
  columns: Column[];
  seedData: Record<string, any>[];
}

export interface DatabaseSchema {
  tables: Table[];
}

export interface Metric {
  id: string;
  label: string;
  table: string;
  field?: string;
  aggregation: "sum" | "count" | "avg";
  filterField?: string;
  filterValue?: string;
  format: "currency" | "number" | "percent";
}

export interface ChartConfig {
  id: string;
  title: string;
  type: "bar" | "line" | "pie";
  table: string;
  groupBy: string;
  valueField?: string;
  aggregation: "sum" | "count" | "avg";
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface FormField {
  name: string;
  controlType: "text" | "number" | "select" | "checkbox" | "date";
  label: string;
  placeholder?: string;
  options?: string[];
  defaultValue?: any;
  required: boolean;
}

export interface FormConfig {
  title: string;
  description: string;
  targetTable: string;
  fields: FormField[];
}

export interface InteractiveButton {
  id: string;
  label: string;
  actionDescription: string;
  targetTable: string;
  condition: string;
  updates: Record<string, any>;
}

export interface AppSpecification {
  appName: string;
  appDescription: string;
  theme: {
    primaryColor: "indigo" | "emerald" | "violet" | "amber" | "rose" | "sky" | "slate";
    accentColor: "indigo" | "emerald" | "violet" | "amber" | "rose" | "sky" | "slate";
    variant: "glassmorphism" | "neo-brutalism" | "flat-minimal" | "professional-dark";
  };
  navigation: Array<{
    id: "dashboard" | "records" | "form" | "analytics";
    label: string;
    icon: "LayoutDashboard" | "Database" | "FileText" | "LineChart";
  }>;
  databaseSchema: DatabaseSchema;
  dashboardConfig: {
    metrics: Metric[];
    charts: ChartConfig[];
  };
  formConfig: FormConfig;
  interactiveButtons: InteractiveButton[];
  developerNotes: string;
}

export interface Project {
  id: string;
  name: string;
  prompt: string;
  spec: AppSpecification;
  createdAt: string;
  activeRows: Record<string, Record<string, any>[]>; // Table record state overrides for live sandbox CRUD
}

export interface ChatMessage {
  id: string;
  sender: "user" | "hercules" | "system";
  content: string;
  timestamp: string;
}
