import { AppData, Provider, ChargeOption } from '../types';
import { defaultModels } from '../data/defaultModels';

// Electron IPC 通信
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

// 数据迁移：将旧的exchangeRate转换为chargeOptions数组
function migrateProvider(provider: any): Provider {
  // 如果已经有chargeOptions，直接返回
  if (provider.chargeOptions && Array.isArray(provider.chargeOptions)) {
    return provider as Provider;
  }

  // 如果有旧的exchangeRate，转换为chargeOptions
  if (provider.exchangeRate) {
    const chargeOption: ChargeOption = {
      id: 'default',
      name: '默认汇率',
      cny: provider.exchangeRate.cny,
      usd: provider.exchangeRate.usd
    };

    return {
      ...provider,
      chargeOptions: [chargeOption],
      exchangeRate: undefined  // 移除旧字段
    } as Provider;
  }

  // 如果都没有，设置默认值
  return {
    ...provider,
    chargeOptions: [{
      id: 'default',
      name: '默认汇率',
      cny: 100,
      usd: 15
    }]
  } as Provider;
}

export const storageService = {
  // 加载数据
  async loadData(): Promise<AppData> {
    if (ipcRenderer) {
      const data = await ipcRenderer.invoke('load-data');
      // 确保models字段存在
      if (!data.models) {
        data.models = defaultModels;
      }
      // 迁移providers数据
      if (data.providers) {
        data.providers = data.providers.map(migrateProvider);
      }
      return data;
    }
    // Fallback for web development
    const stored = localStorage.getItem('appData');
    const data = stored ? JSON.parse(stored) : { providers: [], models: [] };
    // 如果没有models，使用默认模型库
    if (!data.models || data.models.length === 0) {
      data.models = defaultModels;
    }
    // 迁移providers数据
    if (data.providers) {
      data.providers = data.providers.map(migrateProvider);
    }
    return data;
  },

  // 保存数据
  async saveData(data: AppData): Promise<{ success: boolean; error?: string }> {
    if (ipcRenderer) {
      return await ipcRenderer.invoke('save-data', data);
    }
    // Fallback for web development
    localStorage.setItem('appData', JSON.stringify(data));
    return { success: true };
  },

  // 导出数据
  async exportData(): Promise<{ success: boolean; data?: string; error?: string }> {
    if (ipcRenderer) {
      return await ipcRenderer.invoke('export-data');
    }
    // Fallback for web development
    const data = localStorage.getItem('appData');
    return { success: true, data: data || '{"providers":[]}' };
  },

  // 导入数据
  async importData(jsonData: string): Promise<{ success: boolean; error?: string }> {
    if (ipcRenderer) {
      return await ipcRenderer.invoke('import-data', jsonData);
    }
    // Fallback for web development
    try {
      JSON.parse(jsonData); // 验证格式
      localStorage.setItem('appData', jsonData);
      return { success: true };
    } catch (error) {
      return { success: false, error: '无效的JSON格式' };
    }
  }
};
