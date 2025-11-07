import { Model } from '../types';

// 默认模型库（预置常见模型的官方价格）
// 所有价格单位：美元 per 1M tokens
export const defaultModels: Model[] = [
  // OpenAI Models
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    description: '最新的GPT-5，Ph.D级别专业知识',
    inputPrice: 1.25,      // $1.25 per 1M tokens
    outputPrice: 10.0,     // $10 per 1M tokens
    updatedAt: '2025-10-30'
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5-mini',
    provider: 'OpenAI',
    description: 'GPT-5轻量版',
    inputPrice: 0.25,
    outputPrice: 2.0,
    updatedAt: '2025-10-30'
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5-nano',
    provider: 'OpenAI',
    description: 'GPT-5超轻量版',
    inputPrice: 0.05,
    outputPrice: 0.40,
    updatedAt: '2025-10-30'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'GPT-4优化版本，平衡性能和成本',
    inputPrice: 5.0,      // $5 per 1M tokens
    outputPrice: 20.0,    // $20 per 1M tokens
    updatedAt: '2025-10-30'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o-mini',
    provider: 'OpenAI',
    description: '轻量级GPT-4，成本更低',
    inputPrice: 0.15,
    outputPrice: 0.60,
    updatedAt: '2025-10-30'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: '快速且经济的模型',
    inputPrice: 3.0,
    outputPrice: 6.0,
    updatedAt: '2025-10-30'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: '高性能GPT-4版本',
    inputPrice: 10.0,
    outputPrice: 30.0,
    updatedAt: '2025-10-30'
  },
  // Claude Models
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    description: 'Claude最强大的模型，最新版本',
    inputPrice: 15.0,
    outputPrice: 75.0,
    updatedAt: '2025-10-30'
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    description: 'Claude 4系列 - 平衡性能和速度',
    inputPrice: 3.0,
    outputPrice: 15.0,
    updatedAt: '2025-10-30'
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    description: 'Claude最快速、最经济的模型',
    inputPrice: 1.0,
    outputPrice: 5.0,
    updatedAt: '2025-10-30'
  },
  // Google Gemini Models
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: 'Google最新的强大多模态模型',
    inputPrice: 1.25,
    outputPrice: 10.0,
    updatedAt: '2025-10-30'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: '快速且经济的多模态模型',
    inputPrice: 0.10,
    outputPrice: 0.40,
    updatedAt: '2025-10-30'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: '最新的Flash版本，支持推理',
    inputPrice: 0.125,
    outputPrice: 0.50,
    updatedAt: '2025-10-30'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    description: 'Gemini 1.5 Pro - 长上下文支持',
    inputPrice: 1.25,
    outputPrice: 5.0,
    updatedAt: '2025-10-30'
  },
  // Other models
  {
    id: 'grok-4',
    name: 'Grok 4',
    provider: 'xAI',
    description: 'xAI的最新模型，完美得分AIME 2025',
    inputPrice: 5.0,
    outputPrice: 15.0,
    updatedAt: '2025-10-30'
  }
];

