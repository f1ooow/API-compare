import { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStore } from '../store/useStore';
import { Model } from '../types';
import type { ColumnsType } from 'antd/es/table';

export default function ModelManager() {
  const { models, addModel, updateModel, deleteModel } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingModel(null);
    form.resetFields();
    form.setFieldsValue({ updatedAt: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const handleEdit = (model: Model) => {
    setEditingModel(model);
    form.setFieldsValue(model);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteModel(id);
    message.success('删除成功');
  };

  const handleModalClose = () => {
    // 关闭时自动保存（如果表单有效）
    form.validateFields()
      .then((values) => {
        const model: Model = {
          id: editingModel?.id || `model-${Date.now()}`,
          name: values.name,
          provider: values.provider,
          description: values.description,
          inputPrice: values.inputPrice,
          outputPrice: values.outputPrice,
          updatedAt: values.updatedAt
        };

        if (editingModel) {
          updateModel(model);
        } else {
          addModel(model);
        }

        setIsModalOpen(false);
      })
      .catch(() => {
        // 验证失败，询问用户是否放弃修改
        Modal.confirm({
          title: '表单未完成',
          content: '表单还有必填项未填写，是否放弃修改？',
          okText: '放弃',
          cancelText: '继续编辑',
          onOk: () => {
            setIsModalOpen(false);
          }
        });
      });
  };

  const columns: ColumnsType<Model> = [
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.description}</div>
        </div>
      )
    },
    {
      title: '提供商',
      dataIndex: 'provider',
      key: 'provider',
      width: 120,
      render: (provider) => {
        const colors: Record<string, string> = {
          'OpenAI': 'blue',
          'Anthropic': 'purple',
          'Google': 'red'
        };
        return <Tag color={colors[provider] || 'default'}>{provider}</Tag>;
      }
    },
    {
      title: '输入价格',
      dataIndex: 'inputPrice',
      key: 'inputPrice',
      width: 150,
      render: (price) => (
        <div>
          <div>${price.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: '#888' }}>per 1M tokens</div>
        </div>
      )
    },
    {
      title: '输出价格',
      dataIndex: 'outputPrice',
      key: 'outputPrice',
      width: 150,
      render: (price) => (
        <div>
          <div>${price.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: '#888' }}>per 1M tokens</div>
        </div>
      )
    },
    {
      title: '最后更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除？"
            description="删除模型后，使用该模型的服务商分组也会受到影响"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加模型
        </Button>
        <span style={{ marginLeft: 16, color: '#888' }}>
          共 {models.length} 个模型
        </span>
      </div>

      <Table
        columns={columns}
        dataSource={models}
        rowKey="id"
        pagination={false}
        bordered
      />

      <Modal
        title={editingModel ? '编辑模型' : '添加模型'}
        open={isModalOpen}
        onCancel={handleModalClose}
        width={600}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="例如: GPT-4o, Claude Sonnet 4.5" />
          </Form.Item>

          <Form.Item
            name="provider"
            label="提供商"
            rules={[{ required: true, message: '请输入提供商' }]}
          >
            <Input placeholder="例如: OpenAI, Anthropic, Google" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="简短描述模型特点" rows={2} />
          </Form.Item>

          <Form.Item
            name="inputPrice"
            label="官方输入价格（美元 / 1M tokens）"
            rules={[{ required: true, message: '请输入输入价格' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              prefix="$"
              placeholder="0.00"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="outputPrice"
            label="官方输出价格（美元 / 1M tokens）"
            rules={[{ required: true, message: '请输入输出价格' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              prefix="$"
              placeholder="0.00"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="updatedAt"
            label="更新日期"
            rules={[{ required: true, message: '请输入更新日期' }]}
          >
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
