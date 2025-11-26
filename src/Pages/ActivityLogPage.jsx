import React, { useState } from 'react';
import { Table, Tag, Card, Typography, DatePicker, Space, Input, Select, Button, Row, Col, Statistic, Badge, Tooltip, Empty } from 'antd';
import { 
  ThunderboltOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  DownloadOutlined, 
  ReloadOutlined,
  UserOutlined,
  LaptopOutlined,
  SafetyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ActivityLogPage = ({ theme }) => {
  const screens = useBreakpoint();
  const isDark = theme === 'dark';
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Comprehensive dummy data
  const allData = [
    {
      key: '1',
      timestamp: '2025-11-13 14:45:23',
      user: 'System',
      entity: 'Main Entrance Camera',
      category: 'Security',
      action: 'Motion Detected',
      severity: 'info',
      status: 'resolved',
      details: 'High motion activity detected at main entrance. Multiple people entering building.'
    },
    {
      key: '2',
      timestamp: '2025-11-13 14:32:10',
      user: 'admin@company.com',
      entity: 'User Management',
      category: 'User',
      action: 'User Created',
      severity: 'success',
      status: 'completed',
      details: 'New user account created for Sarah Johnson (sarah.j@company.com)'
    },
    {
      key: '3',
      timestamp: '2025-11-13 14:28:45',
      user: 'System',
      entity: 'Kiosk #3 - West Wing',
      category: 'Device',
      action: 'Device Offline',
      severity: 'critical',
      status: 'pending',
      details: 'Connection lost. Last ping failed 3 consecutive times. Requires immediate attention.'
    },
    {
      key: '4',
      timestamp: '2025-11-13 14:15:32',
      user: 'john.doe@company.com',
      entity: 'Authentication Service',
      category: 'Authentication',
      action: 'Login Success',
      severity: 'success',
      status: 'completed',
      details: 'Successful login from desktop application'
    },
    {
      key: '5',
      timestamp: '2025-11-13 14:12:18',
      user: 'jane.smith@company.com',
      entity: 'Role Management',
      category: 'Access Control',
      action: 'Permissions Updated',
      severity: 'warning',
      status: 'completed',
      details: 'Updated permissions for Operator role - Added "manage_devices" permission'
    },
    {
      key: '6',
      timestamp: '2025-11-13 14:05:55',
      user: 'System',
      entity: 'Payment Gateway - Lobby',
      category: 'Transaction',
      action: 'Payment Success',
      severity: 'success',
      status: 'completed',
      details: 'Transaction completed successfully. Amount: $45.99, Transaction ID: TXN-20251113-00234'
    },
    {
      key: '7',
      timestamp: '2025-11-13 13:58:42',
      user: 'unknown@external.net',
      entity: 'Authentication Service',
      category: 'Security',
      action: 'Login Failed',
      severity: 'critical',
      status: 'blocked',
      details: 'Multiple failed login attempts detected. Account temporarily locked for security.'
    },
    {
      key: '8',
      timestamp: '2025-11-13 13:45:30',
      user: 'System',
      entity: 'Backup Service',
      category: 'System',
      action: 'Backup Completed',
      severity: 'success',
      status: 'completed',
      details: 'Daily automated backup completed successfully. Size: 2.4GB'
    },
    {
      key: '9',
      timestamp: '2025-11-13 13:32:15',
      user: 'maintenance@company.com',
      entity: 'Cafeteria Kiosk',
      category: 'Device',
      action: 'Firmware Updated',
      severity: 'info',
      status: 'completed',
      details: 'Device firmware updated from v2.3.1 to v2.4.0. Reboot required.'
    },
    {
      key: '10',
      timestamp: '2025-11-13 13:20:08',
      user: 'System',
      entity: 'Server Room Sensor',
      category: 'Environment',
      action: 'Temperature Alert',
      severity: 'warning',
      status: 'resolved',
      details: 'Temperature exceeded threshold (28°C). Cooling system activated automatically.'
    },
    {
      key: '11',
      timestamp: '2025-11-13 13:10:44',
      user: 'security@company.com',
      entity: 'Access Control System',
      category: 'Security',
      action: 'Access Denied',
      severity: 'warning',
      status: 'reviewed',
      details: 'Unauthorized access attempt at restricted area. Badge ID: 4521 not authorized.'
    },
    {
      key: '12',
      timestamp: '2025-11-13 12:55:22',
      user: 'System',
      entity: 'Network Infrastructure',
      category: 'System',
      action: 'Network Scan Completed',
      severity: 'info',
      status: 'completed',
      details: 'Scheduled network health scan completed. All systems operational.'
    },
    {
      key: '13',
      timestamp: '2025-11-13 12:42:36',
      user: 'admin@company.com',
      entity: 'Camera System',
      category: 'Device',
      action: 'Camera Added',
      severity: 'success',
      status: 'completed',
      details: 'New camera "Parking Lot South" added to monitoring system'
    },
    {
      key: '14',
      timestamp: '2025-11-13 12:30:19',
      user: 'System',
      entity: 'Database Service',
      category: 'System',
      action: 'Database Optimization',
      severity: 'info',
      status: 'completed',
      details: 'Automated database maintenance and optimization completed. Performance improved by 12%.'
    },
    {
      key: '15',
      timestamp: '2025-11-13 12:15:05',
      user: 'hr@company.com',
      entity: 'User Management',
      category: 'User',
      action: 'User Deactivated',
      severity: 'warning',
      status: 'completed',
      details: 'User account deactivated: michael.brown@company.com (Employee resignation)'
    },
    {
      key: '16',
      timestamp: '2025-11-13 11:58:47',
      user: 'System',
      entity: 'Email Service',
      category: 'System',
      action: 'Notification Sent',
      severity: 'info',
      status: 'completed',
      details: 'Daily activity summary email sent to 45 administrators'
    },
    {
      key: '17',
      timestamp: '2025-11-13 11:45:33',
      user: 'supervisor@company.com',
      entity: 'West Wing Display',
      category: 'Device',
      action: 'Content Updated',
      severity: 'info',
      status: 'completed',
      details: 'Digital signage content updated with new company announcements'
    },
    {
      key: '18',
      timestamp: '2025-11-13 11:30:21',
      user: 'System',
      entity: 'License Manager',
      category: 'System',
      action: 'License Warning',
      severity: 'warning',
      status: 'pending',
      details: 'Software license expiring in 30 days. Renewal required.'
    },
    {
      key: '19',
      timestamp: '2025-11-13 11:15:12',
      user: 'operator@company.com',
      entity: 'Lobby Kiosk',
      category: 'Device',
      action: 'Service Restart',
      severity: 'info',
      status: 'completed',
      details: 'Kiosk service restarted successfully after scheduled maintenance'
    },
    {
      key: '20',
      timestamp: '2025-11-13 11:00:00',
      user: 'System',
      entity: 'Monitoring Service',
      category: 'System',
      action: 'Health Check',
      severity: 'success',
      status: 'completed',
      details: 'Hourly system health check completed. All services running normally.'
    }
  ];

  // Filter data based on search and filters
  const filteredData = allData.filter(item => {
    const matchesSearch = searchText === '' || 
      item.user.toLowerCase().includes(searchText.toLowerCase()) ||
      item.entity.toLowerCase().includes(searchText.toLowerCase()) ||
      item.action.toLowerCase().includes(searchText.toLowerCase()) ||
      item.details.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || item.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: allData.length,
    critical: allData.filter(item => item.severity === 'critical').length,
    warning: allData.filter(item => item.severity === 'warning').length,
    success: allData.filter(item => item.severity === 'success').length,
    pending: allData.filter(item => item.status === 'pending').length
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <CloseCircleOutlined />;
      case 'warning': return <WarningOutlined />;
      case 'success': return <CheckCircleOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'User': return <UserOutlined />;
      case 'Device': return <LaptopOutlined />;
      case 'Security': return <SafetyOutlined />;
      case 'Authentication': return <SafetyOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      render: (timestamp) => (
        <Space>
          <ClockCircleOutlined style={{ color: isDark ? '#60a5fa' : '#3b82f6' }} />
          <Text style={{ fontSize: '13px' }}>{timestamp}</Text>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      filters: [
        { text: 'User', value: 'User' },
        { text: 'Device', value: 'Device' },
        { text: 'Security', value: 'Security' },
        { text: 'System', value: 'System' },
        { text: 'Transaction', value: 'Transaction' },
        { text: 'Authentication', value: 'Authentication' },
      ],
      onFilter: (value, record) => record.category === value,
      render: (category) => (
        <Tag icon={getCategoryIcon(category)} color="blue">
          {category}
        </Tag>
      )
    },
    {
      title: 'User/System',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (user) => (
        <Space>
          <UserOutlined style={{ color: isDark ? '#9ca3af' : '#6b7280' }} />
          <Text ellipsis style={{ maxWidth: 150 }} title={user}>
            {user}
          </Text>
        </Space>
      )
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 160,
      render: (action, record) => (
        <Tag 
          icon={getSeverityIcon(record.severity)}
          color={getSeverityColor(record.severity)}
          style={{ fontSize: '13px' }}
        >
          {action}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Completed', value: 'completed' },
        { text: 'Pending', value: 'pending' },
        { text: 'Resolved', value: 'resolved' },
        { text: 'Blocked', value: 'blocked' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusConfig = {
          completed: { color: 'success', text: 'Completed' },
          pending: { color: 'processing', text: 'Pending' },
          resolved: { color: 'success', text: 'Resolved' },
          blocked: { color: 'error', text: 'Blocked' },
          reviewed: { color: 'default', text: 'Reviewed' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Badge status={config.color} text={config.text} />;
      }
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details) => (
        <Tooltip title={details}>
          <Text ellipsis style={{ maxWidth: 400 }}>
            {details}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: () => (
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          size="small"
          style={{ color: isDark ? '#60a5fa' : '#3b82f6' }}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <ThunderboltOutlined /> Activity Log
      </Title>

      {/* Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card 
            bordered={false}
            style={{ 
              background: isDark ? '#1f2937' : '#ffffff',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Statistic 
              title="Total Events" 
              value={stats.total}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: isDark ? '#60a5fa' : '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card 
            bordered={false}
            style={{ 
              background: isDark ? '#1f2937' : '#ffffff',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Statistic 
              title="Critical" 
              value={stats.critical}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card 
            bordered={false}
            style={{ 
              background: isDark ? '#1f2937' : '#ffffff',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Statistic 
              title="Warnings" 
              value={stats.warning}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card 
            bordered={false}
            style={{ 
              background: isDark ? '#1f2937' : '#ffffff',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Statistic 
              title="Pending" 
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        bordered={false}
        style={{ 
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
          background: isDark ? '#1f2937' : '#ffffff'
        }}
        bodyStyle={{ padding: screens.md ? '24px' : '16px' }}
      >
        {/* Filters Section */}
        <Space
          direction="vertical"
          style={{ width: '100%', marginBottom: 16 }}
          size="middle"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search activities..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Category"
                value={selectedCategory}
                onChange={setSelectedCategory}
              >
                <Option value="all">All Categories</Option>
                <Option value="User">User</Option>
                <Option value="Device">Device</Option>
                <Option value="Security">Security</Option>
                <Option value="System">System</Option>
                <Option value="Transaction">Transaction</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Severity"
                value={selectedSeverity}
                onChange={setSelectedSeverity}
              >
                <Option value="all">All Severity</Option>
                <Option value="critical">Critical</Option>
                <Option value="warning">Warning</Option>
                <Option value="success">Success</Option>
                <Option value="info">Info</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                <Option value="all">All Status</Option>
                <Option value="completed">Completed</Option>
                <Option value="pending">Pending</Option>
                <Option value="resolved">Resolved</Option>
                <Option value="blocked">Blocked</Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <RangePicker style={{ width: '100%' }} />
            </Col>
          </Row>
          
          <Row gutter={[8, 8]} justify="end">
            <Col>
              <Button icon={<ReloadOutlined />}>Refresh</Button>
            </Col>
            <Col>
              <Button icon={<FilterOutlined />}>Clear Filters</Button>
            </Col>
            <Col>
              <Button type="primary" icon={<DownloadOutlined />}>Export</Button>
            </Col>
          </Row>
        </Space>

        {filteredData.length === 0 ? (
          <Empty 
            description="No activity logs found"
            style={{ padding: '40px 0' }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} activities`,
              size: screens.xs ? 'small' : 'default',
            }}
            style={{
              background: isDark ? '#1f2937' : '#ffffff'
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default ActivityLogPage;