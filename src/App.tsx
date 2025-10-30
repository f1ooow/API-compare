import { useEffect, useState } from 'react';
import { Layout, Tabs, Button, message } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useStore } from './store/useStore';
import ProviderManager from './components/ProviderManager';
import PriceComparison from './components/PriceComparison';
import ModelManager from './components/ModelManager';
import './App.css';

const { Header, Content } = Layout;

function App() {
  const { loadData, exportData, importData } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-prices-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败: ' + (error as Error).message);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          await importData(text);
          message.success('导入成功');
        } catch (error) {
          message.error('导入失败: ' + (error as Error).message);
        }
      }
    };
    input.click();
  };

  if (loading) {
    return <div style={{ padding: 50, textAlign: 'center' }}>加载中...</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>API服务商价格比较工具</h1>
        <div>
          <Button icon={<UploadOutlined />} onClick={handleImport} style={{ marginRight: 8 }}>
            导入
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
        </div>
      </Header>
      <Content style={{ padding: '20px' }}>
        <Tabs
          defaultActiveKey="comparison"
          items={[
            {
              key: 'comparison',
              label: '💰 比价看板',
              children: <PriceComparison />
            },
            {
              key: 'providers',
              label: '🏪 服务商管理',
              children: <ProviderManager />
            },
            {
              key: 'models',
              label: '🤖 模型管理',
              children: <ModelManager />
            }
          ]}
        />
      </Content>
    </Layout>
  );
}

export default App;
