# API服务商价格比较工具

一个帮助你比较不同API服务商价格的桌面应用工具。

## 功能特性

### 🤖 模型管理
- **预置常见模型**: 内置最新的OpenAI、Claude、Gemini模型及官方价格
- **自定义模型**: 支持添加、编辑、删除模型
- **官方价格跟踪**: 记录每个模型的官方输入/输出价格（per 1M tokens）
- **更新时间**: 跟踪价格更新日期

### 🏪 服务商管理
- **基本信息**: 录入服务商名称、网址
- **灵活汇率设置**: 输入人民币和对应到账美元，自动计算实际汇率
- **多分组支持**: 每个服务商支持多个分组（渠道），不同分组可以有不同价格
- **两种计价方式**:
  - **倍率模式**: 基于官方价格 × 倍率（如1.5倍）
  - **直接价格**: 直接输入该分组的价格
- **从模型库选择**: 不需要手动输入模型名称，直接从模型库中选择

### 💰 比价看板
- **横向对比**: 按模型横向对比所有服务商分组的价格
- **自动标记最优**: 绿色背景高亮每个模型的最低价格
- **实时计算**: 自动计算人民币实际成本
- **筛选搜索**: 按服务商筛选、按模型名称搜索
- **清晰展示**: 同时显示人民币和美元价格

### 💾 数据管理
- **导入/导出**: 支持JSON格式的数据导入导出
- **本地存储**: Electron版存储在系统用户目录，Web版使用localStorage
- **数据备份**: 方便备份和迁移

## 预置模型列表（2025年10月最新）

### OpenAI
- **GPT-5** ($1.25 / $10 per 1M tokens) - 最新！Ph.D级别专业知识
- **GPT-5-mini** ($0.25 / $2 per 1M tokens) - GPT-5轻量版
- **GPT-5-nano** ($0.05 / $0.40 per 1M tokens) - GPT-5超轻量版
- GPT-4o ($5 / $20 per 1M tokens)
- GPT-4o-mini ($0.15 / $0.60 per 1M tokens)
- GPT-3.5 Turbo ($3 / $6 per 1M tokens)
- GPT-4 Turbo ($10 / $30 per 1M tokens)

### Anthropic Claude
- **Claude Opus 4** ($15 / $75 per 1M tokens) - 最强大的模型
- Claude Sonnet 4.5 ($3 / $15 per 1M tokens)
- Claude Haiku 4.5 ($1 / $5 per 1M tokens)

### Google Gemini
- Gemini 2.5 Pro ($1.25 / $10 per 1M tokens)
- Gemini 2.0 Flash ($0.10 / $0.40 per 1M tokens)
- Gemini 2.5 Flash ($0.125 / $0.50 per 1M tokens)
- Gemini 1.5 Pro ($1.25 / $5 per 1M tokens)

### 其他
- **Grok 4** ($5 / $15 per 1M tokens) - xAI最新模型

*价格更新时间: 2025-10-30*

## 技术栈

- **Electron**: 跨平台桌面应用框架
- **React**: UI框架
- **TypeScript**: 类型安全
- **Ant Design**: UI组件库
- **Zustand**: 状态管理
- **Vite**: 构建工具

## 开发运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 仅运行Web版（推荐开发时使用）
npm run dev

# 运行Electron版
npm run electron:dev
```

### 构建打包

```bash
# 构建Web版
npm run build

# 构建Electron应用
npm run electron:build
```

## 使用说明

### 1. 模型管理（可选）

首次使用会自动加载预置的模型库。你也可以：

1. 进入"模型管理"标签
2. 查看、编辑预置模型的价格
3. 添加自定义模型（如果有新模型上线）
4. 删除不需要的模型

### 2. 添加服务商

1. 点击"服务商管理"标签
2. 点击"添加服务商"按钮
3. 填写服务商信息:
   - 服务商名称（如: OpenAI中转）
   - 网址
   - **充值汇率**: 输入人民币金额和对应到账的美元金额（系统会自动计算实际汇率）

### 3. 添加分组和模型

在服务商表单中:

1. **添加分组**: 点击"添加分组"，输入分组名称（如: 渠道A、渠道B）
2. **选择模型**: 从下拉列表中选择模型（支持搜索）
3. **设置价格**（单位：美元 / 1M tokens）:
   - **倍率模式**（推荐）: 输入倍率（如1.5表示官方价格的1.5倍），系统自动计算实际价格
   - **直接价格**: 直接输入该分组的输入/输出价格
4. 可以为每个分组添加多个模型

### 4. 查看比价

1. 点击"比价看板"标签
2. 查看所有模型在不同服务商、不同分组下的价格对比
3. 绿色背景标记的是最优价格
4. 可以按服务商筛选或按模型名称搜索
5. 价格同时显示人民币和美元（单位：per 1M tokens），方便对比

### 5. 数据管理

- **导出**: 点击右上角"导出"按钮，将数据保存为JSON文件
- **导入**: 点击右上角"导入"按钮，从JSON文件加载数据

## 数据存储

- **Electron版**: 数据存储在用户数据目录的JSON文件中
- **Web版**: 数据存储在浏览器的localStorage中

数据文件位置（Electron版）:
- Windows: `%APPDATA%/api-price-comparison/data/providers.json`
- macOS: `~/Library/Application Support/api-price-comparison/data/providers.json`
- Linux: `~/.config/api-price-comparison/data/providers.json`

## 数据格式示例

```json
{
  "providers": [
    {
      "id": "provider-1",
      "name": "服务商A",
      "website": "https://example.com",
      "exchangeRate": {
        "cny": 100,
        "usd": 15
      },
      "groups": [
        {
          "id": "group-1",
          "name": "渠道A",
          "models": {
            "gpt-4o": {
              "modelId": "gpt-4o",
              "modelName": "GPT-4o",
              "pricingMode": "multiplier",
              "multiplier": 1.5
            },
            "claude-sonnet-4-5": {
              "modelId": "claude-sonnet-4-5",
              "modelName": "Claude Sonnet 4.5",
              "pricingMode": "fixed",
              "input": 4.5,
              "output": 22.5
            }
          }
        }
      ]
    }
  ],
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "provider": "OpenAI",
      "description": "最新的GPT-4优化版本",
      "inputPrice": 5.0,
      "outputPrice": 20.0,
      "updatedAt": "2025-01-15"
    }
  ]
}
```

## 使用技巧

### 价格单位说明

所有价格统一按照 **美元 / 1M tokens** 计算：
- 模型库中的官方价格：per 1M tokens
- 服务商分组价格（直接价格模式）：per 1M tokens
- 比价看板显示：per 1M tokens

### 倍率模式 vs 直接价格

- **倍率模式**适合:
  - 服务商明确标注"官方价格的X倍"
  - 价格跟随官方调整
  - 例子: "OpenAI官方价格的1.2倍"

- **直接价格**适合:
  - 服务商给出固定价格
  - 价格不跟随官方调整
  - 需要精确控制价格

### 汇率计算

不同服务商的充值政策不同:
- 服务商A: 充值¥100，到账$15 → 实际汇率 6.67
- 服务商B: 充值¥100，到账$14 → 实际汇率 7.14

系统会自动根据汇率计算人民币实际成本，方便比较。

## 许可证

MIT
