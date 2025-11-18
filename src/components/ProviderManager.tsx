import { useState, useMemo } from 'react';
import { Card, Button, Drawer, Form, Input, InputNumber, Space, message, Popconfirm, Tag, Radio, Select, Collapse, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined, DollarOutlined, ApiOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useStore } from '../store/useStore';
import { Provider, GroupModelPrice } from '../types';
import { calculateExchangeRate, calculateActualPrice } from '../services/calculator';

// 品牌颜色映射
const BRAND_COLORS: Record<string, string> = {
  'OpenAI': '#10a37f',
  'Anthropic': '#d97757',
  'Google': '#4285f4',
  'xAI': '#000000',
  'Meta': '#0668e1',
  'Mistral': '#ff7000',
  '其他': '#8c8c8c'
};

export default function ProviderManager() {
  const { providers, models, addProvider, updateProvider, deleteProvider } = useStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingProvider(null);
    form.resetFields();
    // 预设默认充值方案
    form.setFieldsValue({
      chargeOptions: [{
        id: `charge-${Date.now()}`,
        name: '默认汇率',
        cny: 7,
        usd: 1
      }]
    });
    setIsDrawerOpen(true);
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    form.setFieldsValue(provider);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProvider(id);
    message.success('删除成功');
  };

  const handleDrawerClose = () => {
    // 检查表单是否被修改过
    if (!form.isFieldsTouched()) {
      // 未修改，直接关闭
      setIsDrawerOpen(false);
      return;
    }

    // 表单已修改，执行保存逻辑
    form.validateFields()
      .then((values) => {
        const provider: Provider = {
          id: editingProvider?.id || `provider-${Date.now()}`,
          name: values.name,
          website: values.website,
          notes: values.notes,
          // 使用表单值，如果为空则使用原始数据作为后备
          chargeOptions: values.chargeOptions || editingProvider?.chargeOptions || [],
          groups: values.groups || editingProvider?.groups || []
        };

        if (editingProvider) {
          updateProvider(provider);
        } else {
          addProvider(provider);
        }

        setIsDrawerOpen(false);
      })
      .catch(() => {
        // 验证失败，询问用户是否放弃修改
        Modal.confirm({
          title: '表单未完成',
          content: '表单还有必填项未填写，是否放弃修改？',
          okText: '放弃',
          cancelText: '继续编辑',
          onOk: () => {
            setIsDrawerOpen(false);
          }
        });
      });
  };

  // 获取服务商支持的模型品牌
  const getModelBrands = (provider: Provider): string[] => {
    const brandSet = new Set<string>();
    provider.groups.forEach((group) => {
      Object.keys(group.models).forEach((modelId) => {
        const model = models.find((m) => m.id === modelId);
        if (model) {
          brandSet.add(model.provider);
        }
      });
    });
    return Array.from(brandSet).sort();
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          添加服务商
        </Button>
        <span style={{ marginLeft: 16, color: '#999', fontSize: 14 }}>
          共 {providers.length} 个服务商
        </span>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {providers.map((provider) => {
          const brands = getModelBrands(provider);

          return (
            <Card
              key={provider.id}
              hoverable
              style={{
                borderRadius: 8,
                border: '1px solid #e8e8e8',
                transition: 'all 0.3s',
              }}
              bodyStyle={{ padding: '20px 24px' }}
              onClick={() => handleEdit(provider)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* 左侧：主要信息 */}
                <div style={{ flex: 1 }}>
                  {/* 标题行 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{provider.name}</h3>
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 13, color: '#1890ff', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <GlobalOutlined />
                      访问网站
                    </a>
                  </div>

                  {/* 信息行 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: provider.notes ? 12 : 0 }}>
                    {/* 充值方案 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <DollarOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                      <span style={{ color: '#666', fontSize: 13 }}>充值方案:</span>
                      <Space size={4}>
                        {provider.chargeOptions.map((option) => (
                          <Tag key={option.id} color="green" style={{ margin: 0 }}>
                            {option.name} (¥{calculateExchangeRate(option).toFixed(2)}/USD)
                          </Tag>
                        ))}
                      </Space>
                    </div>

                    {/* 支持模型 */}
                    {brands.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ApiOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                        <span style={{ color: '#666', fontSize: 13 }}>支持模型:</span>
                        <Space size={4}>
                          {brands.map((brand) => (
                            <Tag
                              key={brand}
                              color={BRAND_COLORS[brand] || BRAND_COLORS['其他']}
                              style={{ margin: 0 }}
                            >
                              {brand}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </div>

                  {/* 备注 */}
                  {provider.notes && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12, padding: '8px 12px', background: '#fafafa', borderRadius: 4 }}>
                      <InfoCircleOutlined style={{ color: '#999', fontSize: 14, marginTop: 2 }} />
                      <span style={{ color: '#666', fontSize: 13, flex: 1 }}>{provider.notes}</span>
                    </div>
                  )}
                </div>

                {/* 右侧：操作按钮 */}
                <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(provider);
                    }}
                  >
                    编辑
                  </Button>
                  <Popconfirm
                    title="确定删除？"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDelete(provider.id);
                    }}
                    okText="确定"
                    cancelText="取消"
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {providers.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '60px 20px', background: '#fafafa' }}>
          <ApiOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <div style={{ fontSize: 16, color: '#999', marginBottom: 24 }}>
            暂无服务商，点击上方按钮添加第一个服务商
          </div>
        </Card>
      )}

      <Drawer
        title={editingProvider ? '编辑服务商' : '添加服务商'}
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        width={720}
      >
        <Form form={form} layout="vertical">
          <CollapseForm models={models} />
        </Form>
      </Drawer>
    </div>
  );
}

// Collapse 表单组件（使用 useMemo 稳定引用）
function CollapseForm({ models }: { models: any[] }) {
  const collapseItems = useMemo(() => [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <>
          <Form.Item
            name="name"
            label="服务商名称"
            rules={[{ required: true, message: '请输入服务商名称' }]}
          >
            <Input placeholder="例如: OpenAI中转" />
          </Form.Item>

          <Form.Item
            name="website"
            label="网址"
            rules={[{ required: true, message: '请输入网址' }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea
              placeholder="可选，记录一些关于这个服务商的备注信息"
              rows={3}
            />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'charge',
      label: '充值方案',
      children: <ChargeOptionsManager />,
    },
    {
      key: 'groups',
      label: '分组管理',
      children: <GroupsManager models={models} />,
    },
  ], [models]);

  return <Collapse defaultActiveKey={['basic']} items={collapseItems} />;
}

// 充值方案管理组件
function ChargeOptionsManager() {
  const form = Form.useFormInstance();

  return (
    <Form.List name="chargeOptions">
      {(fields, { add, remove }) => (
        <div>
          <Button
            type="dashed"
            onClick={() =>
              add({ id: `charge-${Date.now()}`, name: '', cny: 0, usd: 0 })
            }
            icon={<PlusOutlined />}
            block
            style={{ marginBottom: 16 }}
          >
            添加充值方案
          </Button>

          <Collapse
            items={fields.map((field, index) => {
              const chargeOption = form.getFieldValue(['chargeOptions', field.name]);
              const rate = chargeOption?.cny && chargeOption?.usd
                ? chargeOption.cny / chargeOption.usd
                : 0;

              return {
                key: field.key,
                label: (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>
                      {chargeOption?.name || `方案 ${index + 1}`}
                      {rate > 0 && <span style={{ marginLeft: 8, color: '#1890ff' }}>¥{rate.toFixed(4)}/USD</span>}
                    </span>
                  </div>
                ),
                extra: (
                  <Popconfirm
                    title="确定删除此充值方案？"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      remove(field.name);
                    }}
                    okText="确定"
                    cancelText="取消"
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                ),
                children: (
                  <>
                    <Form.Item {...field} name={[field.name, 'id']} hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, 'name']}
                      label="方案名称"
                      rules={[{ required: true, message: '请输入方案名称' }]}
                    >
                      <Input placeholder="如: 默认汇率、¥68套餐" />
                    </Form.Item>

                    <Space align="start" style={{ width: '100%' }}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'cny']}
                        label="人民币"
                        rules={[{ required: true, message: '请输入' }]}
                      >
                        <InputNumber min={0} step={1} prefix="¥" placeholder="100" style={{ width: 150 }} />
                      </Form.Item>

                      <span style={{ paddingTop: 30 }}>=</span>

                      <Form.Item
                        {...field}
                        name={[field.name, 'usd']}
                        label="美元"
                        rules={[{ required: true, message: '请输入' }]}
                      >
                        <InputNumber min={0} step={0.01} prefix="$" placeholder="15" style={{ width: 150 }} />
                      </Form.Item>
                    </Space>
                  </>
                ),
              };
            })}
          />

          {fields.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: '#999', border: '1px dashed #d9d9d9', borderRadius: 4 }}>
              暂无充值方案，请点击上方按钮添加
            </div>
          )}
        </div>
      )}
    </Form.List>
  );
}

// 分组管理组件
function GroupsManager({ models }: { models: any[] }) {
  const form = Form.useFormInstance();

  return (
    <Form.List name="groups">
      {(fields, { add, remove }) => (
        <div>
          <Button
            type="dashed"
            onClick={() => add({ id: `group-${Date.now()}`, name: '', models: {} })}
            icon={<PlusOutlined />}
            block
            style={{ marginBottom: 16 }}
          >
            添加分组
          </Button>

          <Collapse
            items={fields.map((field, index) => {
              const group = form.getFieldValue(['groups', field.name]);
              const modelCount = group?.models ? Object.keys(group.models).length : 0;

              return {
                key: field.key,
                label: (
                  <span>
                    {group?.name || `分组 ${index + 1}`}
                    <Tag color="green" style={{ marginLeft: 8 }}>{modelCount} 个模型</Tag>
                  </span>
                ),
                extra: (
                  <Popconfirm
                    title="确定删除此分组？"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      remove(field.name);
                    }}
                    okText="确定"
                    cancelText="取消"
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                ),
                children: (
                  <>
                    <Form.Item
                      {...field}
                      name={[field.name, 'id']}
                      hidden
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, 'name']}
                      label="分组名称"
                      rules={[{ required: true, message: '请输入分组名称' }]}
                    >
                      <Input placeholder="例如: 渠道A" />
                    </Form.Item>

                    <GroupModels groupField={field} models={models} />
                  </>
                ),
              };
            })}
          />

          {fields.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: '#999', border: '1px dashed #d9d9d9', borderRadius: 4 }}>
              暂无分组，请点击上方按钮添加
            </div>
          )}
        </div>
      )}
    </Form.List>
  );
}

// 分组模型管理子组件
function GroupModels({ groupField, models }: { groupField: any; models: any[] }) {
  const [selectedModelId, setSelectedModelId] = useState('');
  const form = Form.useFormInstance();

  const addModel = () => {
    if (!selectedModelId) {
      message.warning('请选择模型');
      return;
    }

    const groupModels = form.getFieldValue(['groups', groupField.name, 'models']) || {};

    if (groupModels[selectedModelId]) {
      message.warning('该模型已添加');
      return;
    }

    const selectedModel = models.find((m) => m.id === selectedModelId);
    if (!selectedModel) return;

    groupModels[selectedModelId] = {
      modelId: selectedModelId,
      modelName: selectedModel.name,
      pricingMode: 'multiplier',
      multiplier: 1.0
    };

    form.setFieldValue(['groups', groupField.name, 'models'], groupModels);
    setSelectedModelId('');
  };

  const removeModel = (modelId: string) => {
    const groupModels = form.getFieldValue(['groups', groupField.name, 'models']) || {};
    delete groupModels[modelId];
    form.setFieldValue(['groups', groupField.name, 'models'], { ...groupModels });
  };

  const updateModelPrice = (modelId: string, updates: Partial<GroupModelPrice>) => {
    const groupModels = form.getFieldValue(['groups', groupField.name, 'models']) || {};
    groupModels[modelId] = { ...groupModels[modelId], ...updates };
    form.setFieldValue(['groups', groupField.name, 'models'], { ...groupModels });
  };

  const groupModels: Record<string, GroupModelPrice> = Form.useWatch(['groups', groupField.name, 'models'], form) || {};
  const availableModels = models.filter((m) => !groupModels[m.id]);

  return (
    <div>
      <div style={{ marginBottom: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
        <Space>
          <Select
            placeholder="选择模型"
            value={selectedModelId}
            onChange={setSelectedModelId}
            style={{ width: 300 }}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={availableModels.map((m) => ({
              label: `${m.name} (${m.provider})`,
              value: m.id
            }))}
          />
          <Button type="primary" onClick={addModel}>添加模型</Button>
        </Space>
      </div>

      {Object.entries(groupModels).length === 0 ? (
        <div style={{ textAlign: 'center', padding: 16, color: '#999', border: '1px dashed #d9d9d9', borderRadius: 4 }}>
          暂无模型，请选择模型添加
        </div>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          {Object.entries(groupModels).map(([modelId, config]) => {
            const model = models.find((m) => m.id === modelId);
            if (!model) return null;

            const actualPrice = calculateActualPrice(config, model);

            return (
              <Card
                key={modelId}
                size="small"
                style={{ background: '#fafafa' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{config.modelName}</strong>
                    <Tag color="blue" style={{ marginLeft: 8 }}>{model.provider}</Tag>
                    <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>
                      官方: ${model.inputPrice} / ${model.outputPrice} (per 1M tokens)
                    </span>
                  </div>
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => removeModel(modelId)}
                  >
                    删除
                  </Button>
                </div>

                <Radio.Group
                  value={config.pricingMode}
                  onChange={(e) => updateModelPrice(modelId, { pricingMode: e.target.value })}
                  style={{ marginBottom: 8 }}
                >
                  <Radio value="multiplier">倍率模式</Radio>
                  <Radio value="fixed">直接价格</Radio>
                </Radio.Group>

                {config.pricingMode === 'multiplier' ? (
                  <div>
                    <Space>
                      <span>倍率:</span>
                      <InputNumber
                        value={config.multiplier}
                        min={0}
                        step={0.1}
                        onChange={(val) => updateModelPrice(modelId, { multiplier: val || 1 })}
                        style={{ width: 100 }}
                        suffix="x"
                      />
                      <span style={{ color: '#888' }}>
                        (实际: ${actualPrice.input.toFixed(4)} / ${actualPrice.output.toFixed(4)} per 1M tokens)
                      </span>
                    </Space>
                  </div>
                ) : (
                  <Space>
                    <InputNumber
                      value={config.input}
                      min={0}
                      step={0.001}
                      onChange={(val) => updateModelPrice(modelId, { input: val || 0 })}
                      prefix="输入 $"
                      placeholder="0.000"
                      style={{ width: 140 }}
                    />
                    <InputNumber
                      value={config.output}
                      min={0}
                      step={0.001}
                      onChange={(val) => updateModelPrice(modelId, { output: val || 0 })}
                      prefix="输出 $"
                      placeholder="0.000"
                      style={{ width: 140 }}
                    />
                    <span style={{ fontSize: 12, color: '#888' }}>/ 1M tokens</span>
                  </Space>
                )}
              </Card>
            );
          })}
        </Space>
      )}
    </div>
  );
}
