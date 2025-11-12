import React from 'react';
import { Table, Tag, Input, Button, Card, Typography, Space } from 'antd';
import { HddOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;

const DevicesPage = ({ theme }) => {
  const columns = [
    {
      title: 'Device ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Device Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'Online' ? 'success' : 'error'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
    },
  ];

  const data = [
    { key: '1', id: 101, name: 'Main Lobby Kiosk', location: '1st Floor, Lobby', status: 'Online', lastSeen: '2025-11-08 10:45 AM' },
    { key: '2', id: 102, name: 'Cafeteria Kiosk', location: '2nd Floor, Cafeteria', status: 'Online', lastSeen: '2025-11-08 10:44 AM' },
    { key: '3', id: 201, name: 'Parking Lot Camera', location: 'External, Lot A', status: 'Offline', lastSeen: '2025-11-08 08:12 AM' },
    { key: '4', id: 103, name: 'West Wing Display', location: '1st Floor, West Wing', status: 'Online', lastSeen: '2025-11-08 10:45 AM' },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <HddOutlined /> Device Management
      </Title>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Space
          direction="vertical"
          style={{ width: '100%', marginBottom: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search devices..."
              style={{ maxWidth: 300, width: '100%' }}
            />
            <Button type="primary" icon={<PlusOutlined />}>
              Add Device
            </Button>
          </div>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: true }} // Enable horizontal scrolling for the table on small screens
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} devices`
          }}
        />
      </Card>
    </div>
  );
};

export default DevicesPage;