import React from 'react';
import { Table, Tag, Card, Typography, DatePicker, Space } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ActivityLogPage = ({ theme }) => {
  const columns = [
    { 
      title: 'Timestamp', 
      dataIndex: 'timestamp', 
      key: 'timestamp', 
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    { 
      title: 'User', 
      dataIndex: 'user', 
      key: 'user' 
    },
    { 
      title: 'Device/Entity', 
      dataIndex: 'entity', 
      key: 'entity' 
    },
    { 
      title: 'Action', 
      dataIndex: 'action', 
      key: 'action', 
      render: action => {
        let color = 'blue';
        if (action.includes('Deleted') || action.includes('Failed')) color = 'volcano';
        if (action.includes('Created') || action.includes('Success')) color = 'green';
        return <Tag color={color}>{action}</Tag>;
      } 
    },
    { 
      title: 'Details', 
      dataIndex: 'details', 
      key: 'details' 
    },
  ];

  const data = [
    { 
      key: '1', 
      timestamp: '2025-11-08 10:30 AM', 
      user: 'System', 
      entity: 'Entrance Cam', 
      action: 'Motion Detected', 
      details: 'High motion level detected at entrance.' 
    },
    { 
      key: '2', 
      timestamp: '2025-11-08 10:28 AM', 
      user: 'System', 
      entity: 'Kiosk #3', 
      action: 'Device Offline', 
      details: 'Ping failed 3 times.' 
    },
    { 
      key: '3', 
      timestamp: '2025-11-08 10:25 AM', 
      user: 'john.doe@example.com', 
      entity: 'User Login', 
      action: 'Login Success', 
      details: 'IP: 192.168.1.1' 
    },
    { 
      key: '4', 
      timestamp: '2025-11-08 10:20 AM', 
      user: 'jane.smith@example.com', 
      entity: 'Role: Operator', 
      action: 'Permissions Updated', 
      details: 'Added "view_logs" permission.' 
    },
    { 
      key: '5', 
      timestamp: '2025-11-08 10:15 AM', 
      user: 'System', 
      entity: 'Lobby Kiosk', 
      action: 'Payment Success', 
      details: 'Transaction ID: 12345XYZ' 
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <ThunderboltOutlined /> Activity Log
      </Title>
      
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Filter by Date:</Text>
          <RangePicker />
        </Space>
        
        <Table 
          columns={columns} 
          dataSource={data}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} activities`
          }}
        />
      </Card>
    </div>
  );
};

export default ActivityLogPage;