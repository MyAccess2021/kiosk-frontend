import React, { useState } from 'react';
import { Card, Table, Tag, Row, Col, Button, Progress, Badge, Space, Tooltip } from 'antd';
import {
  HddOutlined,
  WifiOutlined,
  DisconnectOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
  SyncOutlined,
  EyeOutlined,
  SettingOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ApiOutlined,
  SafetyOutlined,
  BellOutlined
} from '@ant-design/icons';
import { buttonStyles, getButtonStyle } from './utils/buttonStyles';

// Styled Button Component that uses buttonStyles.js
const StyledButton = ({ type = 'primary', theme, children, icon, onClick, size = 'middle', ...props }) => {
  const [isHover, setIsHover] = useState(false);
  const buttonStyle = getButtonStyle(type, theme, isHover);

  return (
    <Button
      icon={icon}
      onClick={onClick}
      size={size}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        ...buttonStyle,
        border: `1px solid ${buttonStyle.borderColor || 'transparent'}`,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

const StatCard = ({ title, value, icon, color, theme, trend, trendValue }) => {
  const isDark = theme === 'dark';

  return (
    <Card
      bordered={false}
      style={{
        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        background: isDark ? '#1f2937' : '#ffffff',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        height: '100%'
      }}
      bodyStyle={{ padding: '24px' }}
      hoverable
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            color: isDark ? '#9ca3af' : '#6b7280',
            marginBottom: '8px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            color: isDark ? '#f3f4f6' : '#111827',
            marginBottom: '8px',
            lineHeight: 1
          }}>
            {value}
          </div>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
              {trend === 'up' ? (
                <RiseOutlined style={{ color: '#10b981', fontSize: '16px' }} />
              ) : (
                <FallOutlined style={{ color: '#ef4444', fontSize: '16px' }} />
              )}
              <span style={{
                fontSize: '14px',
                color: trend === 'up' ? '#10b981' : '#ef4444',
                fontWeight: '600'
              }}>
                {trendValue}
              </span>
              <span style={{ fontSize: '13px', color: isDark ? '#6b7280' : '#9ca3af' }}>
                vs last month
              </span>
            </div>
          )}
        </div>
        <div style={{
          fontSize: 42,
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          backgroundColor: `${color}15`,
          color: color,
          boxShadow: `0 4px 12px ${color}25`
        }}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const HomePage = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';
  const user = { name: 'User', role: 'System Administrator' };
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const activityColumns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 120,
      render: (time) => (
        <Space>
          <ClockCircleOutlined style={{ color: isDark ? '#818cf8' : '#6366f1' }} />
          <span style={{ fontWeight: 500 }}>{time}</span>
        </Space>
      )
    },
    {
      title: 'Device/User',
      dataIndex: 'device',
      key: 'device',
      render: (device, record) => (
        <div>
          <div style={{ fontWeight: 600, color: isDark ? '#f3f4f6' : '#111827' }}>{device}</div>
          <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '2px' }}>
            {record.location}
          </div>
        </div>
      )
    },
    {
      title: 'Event',
      dataIndex: 'event',
      key: 'event',
      width: 180,
      render: (event, record) => (
        <Tag
          icon={
            record.severity === 'high' ? <ExclamationCircleOutlined /> :
              record.severity === 'success' ? <CheckCircleOutlined /> :
                record.severity === 'warning' ? <WarningOutlined /> : null
          }
          color={
            record.severity === 'high' ? 'error' :
              record.severity === 'warning' ? 'warning' :
                record.severity === 'success' ? 'success' : 'default'
          }
          style={{ fontSize: '13px', padding: '4px 12px' }}
        >
          {event}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Badge
          status={status === 'resolved' ? 'success' : status === 'pending' ? 'processing' : 'default'}
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <StyledButton
            type="icon"
            theme={theme}
            icon={<EyeOutlined />}
            size="small"
          >
            View
          </StyledButton>
          {record.status === 'pending' && (
            <StyledButton
              type="success"
              theme={theme}
              icon={<CheckCircleOutlined />}
              size="small"
            >
              Resolve
            </StyledButton>
          )}
        </Space>
      ),
    },
  ];

  const activityData = [
    {
      key: '1',
      time: '10:30 AM',
      device: 'Entrance Cam #1',
      location: 'Building A - Main Entrance',
      event: 'Motion Detected',
      severity: 'default',
      status: 'resolved'
    },
    {
      key: '2',
      time: '10:28 AM',
      device: 'Kiosk #3',
      location: 'Floor 2 - West Wing',
      event: 'Device Offline',
      severity: 'high',
      status: 'pending'
    },
    {
      key: '3',
      time: '10:25 AM',
      device: 'Sarah Johnson',
      location: 'IT Department',
      event: 'User Logged In',
      severity: 'success',
      status: 'resolved'
    },
    {
      key: '4',
      time: '10:22 AM',
      device: 'Lobby Kiosk',
      location: 'Building A - Lobby',
      event: 'Payment Success',
      severity: 'success',
      status: 'resolved'
    },
    {
      key: '5',
      time: '10:18 AM',
      device: 'Security System',
      location: 'Parking Lot',
      event: 'Access Denied',
      severity: 'warning',
      status: 'pending'
    },
    {
      key: '6',
      time: '10:15 AM',
      device: 'Server Room Sensor',
      location: 'Data Center',
      event: 'Temperature Normal',
      severity: 'success',
      status: 'resolved'
    },
  ];

  const deviceStatusColumns = [
    {
      title: 'Device Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600, color: isDark ? '#f3f4f6' : '#111827' }}>{name}</div>
          <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '2px' }}>
            {record.type}
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag
          icon={status === 'Online' ? <WifiOutlined /> : <DisconnectOutlined />}
          color={status === 'Online' ? 'success' : 'error'}
          style={{ fontSize: '13px', padding: '4px 12px' }}
        >
          {status}
        </Tag>
      )
    },
    {
      title: 'Health',
      dataIndex: 'health',
      key: 'health',
      width: 120,
      render: (health) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Progress
            percent={health}
            size="small"
            strokeColor={health > 80 ? '#10b981' : health > 50 ? '#f59e0b' : '#ef4444'}
            style={{ flex: 1, marginBottom: 0 }}
            showInfo={false}
          />
          <span style={{ fontSize: '13px', fontWeight: 500 }}>{health}%</span>
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: () => (
        <Space size="small">
          <Tooltip title="View Details">
            <StyledButton
              type="icon"
              theme={theme}
              icon={<EyeOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Settings">
            <StyledButton
              type="secondary"
              theme={theme}
              icon={<SettingOutlined />}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const deviceData = [
    { key: '1', name: 'Main Lobby Kiosk', type: 'Interactive Kiosk', status: 'Online', health: 95 },
    { key: '2', name: 'Cafeteria Kiosk', type: 'Payment Terminal', status: 'Online', health: 88 },
    { key: '3', name: 'Parking Lot Camera', type: 'Security Camera', status: 'Offline', health: 0 },
    { key: '4', name: 'West Wing Display', type: 'Digital Signage', status: 'Online', health: 92 },
    { key: '5', name: 'Server Room Sensor', type: 'IoT Sensor', status: 'Online', health: 98 },
  ];

  const alertsData = [
    { key: '1', title: 'Kiosk #3 Offline', severity: 'high', time: '5 min ago', description: 'Device lost connection' },
    { key: '2', title: 'High Temperature', severity: 'warning', time: '15 min ago', description: 'Server room temperature elevated' },
    { key: '3', title: 'Failed Login Attempts', severity: 'warning', time: '30 min ago', description: 'Multiple failed login attempts detected' },
  ];

  const systemHealthData = [
    { label: 'Network Uptime', value: 99.8, color: '#10b981' },
    { label: 'System Performance', value: 94, color: '#3b82f6' },
    { label: 'Security Score', value: 87, color: '#f59e0b' },
    { label: 'Device Reliability', value: 96, color: '#6366f1' },
  ];

  return (
    <div style={{ padding: '0' }}>
      {/* Header Section */}
      <div style={{
        marginBottom: 32,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: 0,
            color: isDark ? '#f3f4f6' : '#111827'
          }}>
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p style={{
            fontSize: '16px',
            color: isDark ? '#9ca3af' : '#6b7280',
            margin: '8px 0 0 0'
          }}>
            {user?.role} • Last login: Today at 9:15 AM
          </p>
        </div>
        <Space size="middle" wrap>
          <StyledButton
            type="secondary"
            theme={theme}
            icon={<BellOutlined />}
          >
            Notifications
          </StyledButton>
          <StyledButton
            type="primary"
            theme={theme}
            icon={refreshing ? <SyncOutlined spin /> : <ReloadOutlined />}
            onClick={handleRefresh}
          >
            Refresh Data
          </StyledButton>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Devices"
            value="150"
            icon={<HddOutlined />}
            color="#3b82f6"
            theme={theme}
            trend="up"
            trendValue="+12%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Online"
            value="142"
            icon={<WifiOutlined />}
            color="#10b981"
            theme={theme}
            trend="up"
            trendValue="+5%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Offline"
            value="8"
            icon={<DisconnectOutlined />}
            color="#ef4444"
            theme={theme}
            trend="down"
            trendValue="-3%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Active Alerts"
            value="3"
            icon={<WarningOutlined />}
            color="#f59e0b"
            theme={theme}
            trend="down"
            trendValue="-7%"
          />
        </Col>
      </Row>

      {/* System Health Overview & Alerts */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={8}>
          <Card
            title={
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                <SafetyOutlined style={{ marginRight: '8px', color: isDark ? '#818cf8' : '#6366f1' }} />
                System Health
              </span>
            }
            bordered={false}
            style={{
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
              background: isDark ? '#1f2937' : '#ffffff',
              borderRadius: '12px',
              height: '100%'
            }}
            extra={
              <StyledButton type="secondary" theme={theme} size="small" icon={<EyeOutlined />}>
                View All
              </StyledButton>
            }
          >
            {systemHealthData.map((item, index) => (
              <div key={index} style={{ marginBottom: index < systemHealthData.length - 1 ? '20px' : 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <span>{item.label}</span>
                  <span style={{ color: item.color }}>{item.value}%</span>
                </div>
                <Progress
                  percent={item.value}
                  strokeColor={item.color}
                  showInfo={false}
                  strokeWidth={8}
                />
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title={
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                <WarningOutlined style={{ marginRight: '8px', color: '#f59e0b' }} />
                Active Alerts
              </span>
            }
            bordered={false}
            style={{
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
              background: isDark ? '#1f2937' : '#ffffff',
              borderRadius: '12px',
              height: '100%'
            }}
            extra={
              <StyledButton type="secondary" theme={theme} size="small" icon={<EyeOutlined />}>
                View All
              </StyledButton>
            }
          >
            {alertsData.map((alert, index) => (
              <div
                key={alert.key}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                  marginBottom: index < alertsData.length - 1 ? '12px' : 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap', // Responsive wrapping
                  gap: '12px'
                }}
              >
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <Tag color={alert.severity === 'high' ? 'error' : 'warning'}>
                      {alert.severity.toUpperCase()}
                    </Tag>
                    <span style={{ fontWeight: '600', fontSize: '15px' }}>{alert.title}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                    {alert.description}
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#6b7280' : '#9ca3af', marginTop: '4px' }}>
                    <ClockCircleOutlined /> {alert.time}
                  </div>
                </div>
                <Space wrap>
                  <StyledButton type="icon" theme={theme} size="small" icon={<EyeOutlined />}>
                    View
                  </StyledButton>
                  <StyledButton type="success" theme={theme} size="small" icon={<CheckCircleOutlined />}>
                    Resolve
                  </StyledButton>
                </Space>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Recent Activity and Device Status */}
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={14}>
          <Card
            title={
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                <ThunderboltOutlined style={{ marginRight: '8px', color: isDark ? '#818cf8' : '#6366f1' }} />
                Recent Activity
              </span>
            }
            bordered={false}
            style={{
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
              background: isDark ? '#1f2937' : '#ffffff',
              borderRadius: '12px'
            }}
            extra={
              <Space wrap>
                <StyledButton type="secondary" theme={theme} size="small" icon={<ReloadOutlined />}>
                  Refresh
                </StyledButton>
                <StyledButton type="primary" theme={theme} size="small" icon={<EyeOutlined />}>
                  View All
                </StyledButton>
              </Space>
            }
          >
            <Table
              columns={activityColumns}
              dataSource={activityData}
              pagination={{
                pageSize: 6,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} activities`
              }}
              size="middle"
              scroll={{ x: 800 }} // Enable horizontal scroll on small screens
              style={{
                background: isDark ? '#1f2937' : '#ffffff'
              }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            title={
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                <ApiOutlined style={{ marginRight: '8px', color: isDark ? '#818cf8' : '#6366f1' }} />
                Device Status
              </span>
            }
            bordered={false}
            style={{
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
              background: isDark ? '#1f2937' : '#ffffff',
              borderRadius: '12px'
            }}
            extra={
              <Space wrap>
                <StyledButton type="secondary" theme={theme} size="small" icon={<SettingOutlined />}>
                  Manage
                </StyledButton>
                <StyledButton type="primary" theme={theme} size="small" icon={<EyeOutlined />}>
                  View All
                </StyledButton>
              </Space>
            }
          >
            <Table
              columns={deviceStatusColumns}
              dataSource={deviceData}
              pagination={false}
              size="middle"
              scroll={{ x: 500 }} // Enable horizontal scroll on small screens
              style={{
                background: isDark ? '#1f2937' : '#ffffff'
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;