import { create } from 'zustand';
import { debounce } from 'lodash-es';
import { AppData, Provider, Model } from '../types';
import { storageService } from '../services/storage';

interface AppStore extends AppData {
  // Actions
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  addProvider: (provider: Provider) => void;
  updateProvider: (provider: Provider) => void;
  deleteProvider: (id: string) => void;
  addModel: (model: Model) => void;
  updateModel: (model: Model) => void;
  deleteModel: (id: string) => void;
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
}

// Create a debounced save function (1 second delay)
const debouncedSave = debounce(async (data: AppData) => {
  await storageService.saveData(data);
}, 1000);

export const useStore = create<AppStore>((set, get) => ({
  providers: [],
  models: [],

  loadData: async () => {
    const data = await storageService.loadData();
    set(data);
  },

  saveData: async () => {
    const { providers, models } = get();
    debouncedSave({ providers, models });
  },

  addProvider: (provider) => {
    set((state) => ({
      providers: [...state.providers, provider]
    }));
    get().saveData();
  },

  updateProvider: (provider) => {
    set((state) => ({
      providers: state.providers.map((p) => (p.id === provider.id ? provider : p))
    }));
    get().saveData();
  },

  deleteProvider: (id) => {
    set((state) => ({
      providers: state.providers.filter((p) => p.id !== id)
    }));
    get().saveData();
  },

  addModel: (model) => {
    set((state) => ({
      models: [...state.models, model]
    }));
    get().saveData();
  },

  updateModel: (model) => {
    set((state) => ({
      models: state.models.map((m) => (m.id === model.id ? model : m))
    }));
    get().saveData();
  },

  deleteModel: (id) => {
    set((state) => {
      // 删除模型
      const newModels = state.models.filter((m) => m.id !== id);

      // 同时从所有服务商的分组中移除该模型的引用
      const newProviders = state.providers.map((provider) => ({
        ...provider,
        groups: provider.groups.map((group) => {
          // 从 models 对象中移除该模型ID
          const { [id]: removedModel, ...remainingModels } = group.models;
          return {
            ...group,
            models: remainingModels
          };
        })
      }));

      return {
        models: newModels,
        providers: newProviders
      };
    });
    get().saveData();
  },

  exportData: async () => {
    const result = await storageService.exportData();
    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.error || '导出失败');
  },

  importData: async (jsonData) => {
    const result = await storageService.importData(jsonData);
    if (result.success) {
      await get().loadData();
    } else {
      throw new Error(result.error || '导入失败');
    }
  }
}));
