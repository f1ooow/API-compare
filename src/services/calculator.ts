import { ChargeOption, Provider, PriceComparisonRow, PriceCell, Model, GroupModelPrice } from '../types';

// 计算充值方案的实际汇率 (人民币 / 美元)
export function calculateExchangeRate(option: ChargeOption): number {
  return option.cny / option.usd;
}

// 将美元价格转换为人民币
export function convertUsdToCny(usdPrice: number, option: ChargeOption): number {
  const exchangeRate = calculateExchangeRate(option);
  return usdPrice * exchangeRate;
}

// 根据模型库和分组配置计算实际价格（美元/1M tokens）
export function calculateActualPrice(
  modelConfig: GroupModelPrice,
  modelLibrary: Model | undefined
): { input: number; output: number } {
  if (modelConfig.pricingMode === 'fixed') {
    // 直接价格模式
    return {
      input: modelConfig.input || 0,
      output: modelConfig.output || 0
    };
  } else {
    // 倍率模式
    if (!modelLibrary) {
      return { input: 0, output: 0 };
    }
    const multiplier = modelConfig.multiplier || 1;
    // 官方价格已经是 per 1M tokens，直接乘以倍率
    return {
      input: modelLibrary.inputPrice * multiplier,
      output: modelLibrary.outputPrice * multiplier
    };
  }
}

// 生成比价表格数据
export function generatePriceComparison(providers: Provider[], models: Model[]): PriceComparisonRow[] {
  // 创建模型库的映射以便快速查找
  const modelMap = new Map<string, Model>(models.map((m) => [m.id, m]));

  // 收集所有使用的模型ID
  const allModelIds = new Set<string>();
  providers.forEach((provider) => {
    provider.groups.forEach((group) => {
      Object.keys(group.models).forEach((modelId) => allModelIds.add(modelId));
    });
  });

  const rows: PriceComparisonRow[] = [];

  // 为每个模型创建输入/输出两行
  allModelIds.forEach((modelId) => {
    const model = modelMap.get(modelId);
    if (!model) return;

    // 输入价格行
    const inputPrices: PriceCell[] = [];
    // 输出价格行
    const outputPrices: PriceCell[] = [];

    providers.forEach((provider) => {
      provider.groups.forEach((group) => {
        const modelConfig = group.models[modelId];
        if (modelConfig) {
          const actualPrice = calculateActualPrice(modelConfig, model);

          // 为每个充值方案生成价格单元格
          provider.chargeOptions.forEach((chargeOption) => {
            inputPrices.push({
              providerName: provider.name,
              groupName: group.name,
              chargeOptionName: chargeOption.name,
              usdPrice: actualPrice.input,
              cnyPrice: convertUsdToCny(actualPrice.input, chargeOption),
              isLowest: false
            });

            outputPrices.push({
              providerName: provider.name,
              groupName: group.name,
              chargeOptionName: chargeOption.name,
              usdPrice: actualPrice.output,
              cnyPrice: convertUsdToCny(actualPrice.output, chargeOption),
              isLowest: false
            });
          });
        }
      });
    });

    // 标记最低价格
    if (inputPrices.length > 0) {
      const minCnyPrice = Math.min(...inputPrices.map((p) => p.cnyPrice));
      inputPrices.forEach((p) => {
        if (p.cnyPrice === minCnyPrice) {
          p.isLowest = true;
        }
      });
    }

    if (outputPrices.length > 0) {
      const minCnyPrice = Math.min(...outputPrices.map((p) => p.cnyPrice));
      outputPrices.forEach((p) => {
        if (p.cnyPrice === minCnyPrice) {
          p.isLowest = true;
        }
      });
    }

    rows.push({
      modelName: model.name,
      type: 'input',
      prices: inputPrices
    });

    rows.push({
      modelName: model.name,
      type: 'output',
      prices: outputPrices
    });
  });

  return rows;
}
