import { useMemo, useState } from 'react';
import { Table, Select, Space, Card, Empty, Tag, Input, Modal, Descriptions } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined, GlobalOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useStore } from '../store/useStore';
import { generatePriceComparison, calculateExchangeRate } from '../services/calculator';
import type { ColumnsType, ColumnType, ColumnGroupType } from 'antd/es/table';
import type { PriceComparisonRow, Provider } from '../types';

// 服务商背景色
const PROVIDER_COLORS = [
  '#e6f4ff', // 蓝色
  '#f6ffed', // 绿色
  '#fff7e6', // 橙色
  '#f9f0ff', // 紫色
  '#fff1f0', // 红色
  '#e6fffb', // 青色
  '#fffbe6', // 黄色
  '#f0f5ff', // 靛蓝
];

type SortOrder = 'ascend' | 'descend' | null;

export default function PriceComparison() {
  const { providers, models } = useStore();
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [searchModel, setSearchModel] = useState('');
  const [sortModelName, setSortModelName] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // 生成比价数据
  const comparisonData = useMemo(() => {
    const filteredProviders = selectedProviders.length > 0
      ? providers.filter((p) => selectedProviders.includes(p.id))
      : providers;

    return generatePriceComparison(filteredProviders, models);
  }, [providers, models, selectedProviders]);

  // 过滤搜索和排序
  const filteredData = useMemo(() => {
    let data = comparisonData;

    // 如果正在排序，只显示被选中的模型
    if (sortModelName && sortOrder) {
      data = data.filter((row) => row.modelName === sortModelName);
    }
    // 否则应用搜索过滤
    else if (searchModel.trim()) {
      const search = searchModel.toLowerCase();
      data = data.filter((row) =>
        row.modelName.toLowerCase().includes(search)
      );
    }

    return data;
  }, [comparisonData, searchModel, sortModelName, sortOrder]);

  // 按服务商组织列结构（带排序和过滤）
  const { providerGroups, providerColorMap } = useMemo(() => {
    // 首先收集所有服务商并分配颜色
    const providerNames = new Set<string>();
    comparisonData.forEach((row) => {
      row.prices.forEach((price) => {
        providerNames.add(price.providerName);
      });
    });

    // 创建服务商->颜色的映射
    const colorMap = new Map<string, string>();
    Array.from(providerNames).sort().forEach((name, index) => {
      colorMap.set(name, PROVIDER_COLORS[index % PROVIDER_COLORS.length]);
    });

    // 如果正在排序，返回扁平的列数组（不分组）
    if (sortModelName && sortOrder) {
      const inputRow = comparisonData.find((r) => r.modelName === sortModelName && r.type === 'input');
      const outputRow = comparisonData.find((r) => r.modelName === sortModelName && r.type === 'output');

      if (inputRow && outputRow) {
        // 收集所有包含该模型的列，并按价格排序
        const columnKeys = new Set<string>();
        [...inputRow.prices, ...outputRow.prices].forEach((price) => {
          const columnKey = `${price.providerName}|||${price.groupName}|||${price.chargeOptionName}`;
          columnKeys.add(columnKey);
        });

        // 计算每列的平均价格并排序
        const columnsWithPrice = Array.from(columnKeys).map((columnKey) => {
          const inputPrice = inputRow.prices.find(
            (p) => `${p.providerName}|||${p.groupName}|||${p.chargeOptionName}` === columnKey
          );
          const outputPrice = outputRow.prices.find(
            (p) => `${p.providerName}|||${p.groupName}|||${p.chargeOptionName}` === columnKey
          );

          const avgPrice = inputPrice && outputPrice
            ? (inputPrice.cnyPrice + outputPrice.cnyPrice) / 2
            : Infinity;

          return { columnKey, avgPrice };
        });

        // 按价格排序
        columnsWithPrice.sort((a, b) => {
          if (sortOrder === 'ascend') {
            return a.avgPrice - b.avgPrice;
          } else {
            return b.avgPrice - a.avgPrice;
          }
        });

        // 返回扁平结构
        return {
          providerGroups: [
            {
              providerName: '', // 空字符串表示不分组
              columns: columnsWithPrice.map((item) => item.columnKey)
            }
          ],
          providerColorMap: colorMap
        };
      }
    }

    // 没有排序时，按服务商分组
    const groups = new Map<string, { providerName: string; columns: string[] }>();

    comparisonData.forEach((row) => {
      row.prices.forEach((price) => {
        const key = price.providerName;
        const columnKey = `${price.providerName}|||${price.groupName}|||${price.chargeOptionName}`;

        if (!groups.has(key)) {
          groups.set(key, {
            providerName: price.providerName,
            columns: []
          });
        }

        const group = groups.get(key)!;
        if (!group.columns.includes(columnKey)) {
          group.columns.push(columnKey);
        }
      });
    });

    return {
      providerGroups: Array.from(groups.values()),
      providerColorMap: colorMap
    };
  }, [comparisonData, sortModelName, sortOrder]);

  // 处理排序点击
  const handleSortClick = (modelName: string) => {
    if (sortModelName === modelName) {
      // 切换排序顺序：升序 -> 降序 -> 不排序
      if (sortOrder === 'ascend') {
        setSortOrder('descend');
      } else if (sortOrder === 'descend') {
        setSortOrder(null);
        setSortModelName(null);
      }
    } else {
      // 新模型，设置为升序
      setSortModelName(modelName);
      setSortOrder('ascend');
    }
  };

  // 处理服务商列头点击
  const handleProviderClick = (providerName: string) => {
    const provider = providers.find((p) => p.name === providerName);
    if (provider) {
      setSelectedProvider(provider);
      setShowProviderModal(true);
    }
  };

  // 构建表格列
  const columns: ColumnsType<PriceComparisonRow> = [
    {
      title: (
        <div>
          模型
          <div style={{ fontSize: 11, color: '#888', fontWeight: 'normal' }}>
            点击聚焦单个模型
          </div>
        </div>
      ),
      dataIndex: 'modelName',
      key: 'modelName',
      fixed: 'left',
      width: 180,
      render: (text, record) => {
        if (record.type === 'input') {
          const isSorting = sortModelName === text;
          return {
            children: (
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 0'
                }}
                onClick={() => handleSortClick(text)}
              >
                <span>{text}</span>
                {isSorting && (
                  sortOrder === 'ascend' ? (
                    <SortAscendingOutlined style={{ color: '#1890ff' }} />
                  ) : (
                    <SortDescendingOutlined style={{ color: '#1890ff' }} />
                  )
                )}
              </div>
            ),
            props: { rowSpan: 2 }
          };
        }
        return {
          children: null,
          props: { rowSpan: 0 }
        };
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      fixed: 'left',
      width: 90,
      render: (type: 'input' | 'output') => (
        <Tag color={type === 'input' ? 'blue' : 'green'}>
          {type === 'input' ? '输入' : '输出'}
        </Tag>
      )
    },
    // 按服务商分组的列（或排序时的扁平列）
    ...providerGroups.flatMap((group, groupIndex) => {
      const createColumn = (columnKey: string): ColumnType<PriceComparisonRow> => {
        const [providerName, groupName, chargeOptionName] = columnKey.split('|||');
        // 无论是否排序，都根据 providerName 获取颜色
        const columnBgColor = providerColorMap.get(providerName) || PROVIDER_COLORS[0];

        return {
          title: (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 2 }}>{providerName}</div>
              <div style={{ fontSize: 12, color: '#1890ff', marginBottom: 2 }}>{groupName}</div>
              <div style={{ fontSize: 11, color: '#52c41a' }}>{chargeOptionName}</div>
            </div>
          ),
          key: columnKey,
          width: 160,
          align: 'center' as const,
          onHeaderCell: () => ({
            style: { backgroundColor: columnBgColor }
          }),
          onCell: () => ({
            style: { backgroundColor: `${columnBgColor}88` }
          }),
          render: (_: any, record: PriceComparisonRow) => {
            const price = record.prices.find(
              (p) => `${p.providerName}|||${p.groupName}|||${p.chargeOptionName}` === columnKey
            );

            if (!price) {
              return <span style={{ color: '#ccc' }}>-</span>;
            }

            return (
              <div
                className={price.isLowest ? 'lowest-price' : ''}
                style={{
                  padding: '8px 4px',
                  borderRadius: 4,
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>
                  ¥{price.cnyPrice.toFixed(4)}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  ${price.usdPrice.toFixed(4)}
                </div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                  / 1M tokens
                </div>
              </div>
            );
          }
        };
      };

      // 如果正在排序（providerName 为空），返回扁平列
      if (group.providerName === '') {
        return group.columns.map((columnKey) => createColumn(columnKey));
      }

      // 否则返回分组列
      // 获取该服务商的颜色
      const groupBgColor = providerColorMap.get(group.providerName) || PROVIDER_COLORS[groupIndex % PROVIDER_COLORS.length];

      const childrenColumns: ColumnType<PriceComparisonRow>[] = group.columns.map((columnKey) => {
        const [, groupName, chargeOptionName] = columnKey.split('|||');

        return {
          title: (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#1890ff', marginBottom: 2 }}>{groupName}</div>
              <div style={{ fontSize: 11, color: '#52c41a' }}>{chargeOptionName}</div>
            </div>
          ),
          key: columnKey,
          width: 160,
          align: 'center' as const,
          onHeaderCell: () => ({
            style: { backgroundColor: groupBgColor }
          }),
          onCell: () => ({
            style: { backgroundColor: `${groupBgColor}88` }
          }),
          render: (_: any, record: PriceComparisonRow) => {
            const price = record.prices.find(
              (p) => `${p.providerName}|||${p.groupName}|||${p.chargeOptionName}` === columnKey
            );

            if (!price) {
              return <span style={{ color: '#ccc' }}>-</span>;
            }

            return (
              <div
                className={price.isLowest ? 'lowest-price' : ''}
                style={{
                  padding: '8px 4px',
                  borderRadius: 4,
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>
                  ¥{price.cnyPrice.toFixed(4)}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  ${price.usdPrice.toFixed(4)}
                </div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                  / 1M tokens
                </div>
              </div>
            );
          }
        };
      });

      return [
        {
          title: (
            <div
              style={{
                fontWeight: 'bold',
                fontSize: 14,
                textAlign: 'center',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleProviderClick(group.providerName);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(24, 144, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <InfoCircleOutlined style={{ marginRight: 6, fontSize: 12 }} />
              {group.providerName}
            </div>
          ),
          key: `provider-${group.providerName}`,
          children: childrenColumns
        } as ColumnGroupType<PriceComparisonRow>
      ];
    })
  ];

  if (providers.length === 0) {
    return (
      <Card>
        <Empty description="暂无服务商数据，请先添加服务商" />
      </Card>
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <span>筛选服务商:</span>
          <Select
            mode="multiple"
            placeholder="全部服务商"
            style={{ minWidth: 300 }}
            value={selectedProviders}
            onChange={setSelectedProviders}
            options={providers.map((p) => ({
              label: p.name,
              value: p.id
            }))}
            allowClear
          />

          <Input.Search
            placeholder="搜索模型..."
            style={{ width: 200 }}
            value={searchModel}
            onChange={(e) => setSearchModel(e.target.value)}
            allowClear
          />
        </Space>
      </Card>

      {filteredData.length === 0 ? (
        <Card>
          <Empty description="暂无价格数据" />
        </Card>
      ) : (
        <Card>
          <div style={{ marginBottom: 12, color: '#888', fontSize: 13 }}>
            💡 价格单位: 人民币/美元 per 1M tokens | <span style={{ background: '#d9f7be', padding: '2px 6px', borderRadius: 3 }}>绿色背景</span> 表示最优价格 | 点击模型名可排序并聚焦该模型 | <span style={{ color: '#1890ff', fontWeight: 500 }}>点击服务商列头</span>查看详细信息
          </div>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey={(record) => `${record.modelName}-${record.type}`}
            pagination={false}
            scroll={{ x: 'max-content' }}
            bordered
            size="middle"
          />
        </Card>
      )}

      {/* 服务商信息弹窗 */}
      <Modal
        title={
          <div>
            <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            服务商信息
          </div>
        }
        open={showProviderModal}
        onCancel={() => setShowProviderModal(false)}
        footer={null}
        width={600}
      >
        {selectedProvider && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="名称">
                <strong style={{ fontSize: 16 }}>{selectedProvider.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="网址">
                <a
                  href={selectedProvider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <GlobalOutlined />
                  {selectedProvider.website}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="充值方案">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {selectedProvider.chargeOptions.map((option) => (
                    <div key={option.id} style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {option.name}
                      </div>
                      <div style={{ fontSize: 13, color: '#666' }}>
                        充值 ¥{option.cny} = ${option.usd}
                        <Tag color="green" style={{ marginLeft: 8 }}>
                          汇率: ¥{calculateExchangeRate(option).toFixed(4)}/USD
                        </Tag>
                      </div>
                    </div>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="分组数量">
                <Tag color="blue">{selectedProvider.groups.length} 个分组</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="支持模型数">
                <Tag color="purple">
                  {selectedProvider.groups.reduce(
                    (sum, group) => sum + Object.keys(group.models).length,
                    0
                  )}{' '}
                  个模型
                </Tag>
              </Descriptions.Item>
              {selectedProvider.notes && (
                <Descriptions.Item label="备注">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{selectedProvider.notes}</div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
