// 模型库中的模型
export interface Model {
  id: string;
  name: string;
  provider: string; // Google, OpenAI, Anthropic 等
  description?: string;
  inputPrice: number;   // 官方输入价格 美元/1M tokens
  outputPrice: number;  // 官方输出价格 美元/1M tokens
  updatedAt: string;    // 最后更新时间
}

// 分组中的模型价格配置
export interface GroupModelPrice {
  modelId: string;
  modelName: string;
  pricingMode: 'multiplier' | 'fixed'; // 倍率模式或直接价格模式
  multiplier?: number;  // 倍率（如 1.5 表示官方价格的1.5倍）
  input?: number;       // 直接输入价格（美元/1M tokens）
  output?: number;      // 直接输出价格（美元/1M tokens）
}

// 分组（渠道）
export interface Group {
  id: string;
  name: string;
  models: Record<string, GroupModelPrice>; // 模型ID -> 价格配置
}

// 充值方案
export interface ChargeOption {
  id: string;
  name: string;     // 方案名称，如 "默认汇率" 或 "¥68套餐"
  cny: number;      // 人民币金额
  usd: number;      // 到账美元
}

// 服务商
export interface Provider {
  id: string;
  name: string;
  website: string;
  notes?: string;  // 备注信息（可选）
  chargeOptions: ChargeOption[];  // 充值方案列表（支持多个）
  groups: Group[];
}

// 应用数据
export interface AppData {
  providers: Provider[];
  models: Model[];
}

// 比价表格数据行
export interface PriceComparisonRow {
  modelName: string;
  type: 'input' | 'output';
  prices: PriceCell[];
}

// 价格单元格
export interface PriceCell {
  providerName: string;
  groupName: string;
  chargeOptionName: string;  // 充值方案名称
  usdPrice: number;
  cnyPrice: number;
  isLowest: boolean;
}
