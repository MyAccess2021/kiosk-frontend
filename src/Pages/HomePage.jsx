// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Card, Progress, Avatar, Button, Space, Badge } from 'antd';
import { 
  ArrowRightOutlined, 
  PlayCircleOutlined, 
  CheckCircleFilled, 
  LaptopOutlined,
  ThunderboltFilled 
} from '@ant-design/icons';
import { getApplications } from '../services/applicationService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const HomePage = ({ theme }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  
  useEffect(() => {
    getApplications().then(res => setApplications(res?.applications || []));
  }, []);

  // Universal Glass Style
  const glassStyle = {
    background: theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.03)' 
      : 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '30px',
    border: theme === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.08)'
      : '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
    overflow: 'hidden'
  };

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '40px' }}>
        <Title level={1} style={{ 
          fontSize: '42px', 
          margin: 0, 
          fontWeight: 800,
          color: theme === 'dark' ? '#fff' : '#1a1a1a',
          letterSpacing: '-1px'
        }}>
          Welcome in, Nixtio
        </Title>
        <Space size="large" style={{ marginTop: '10px' }}>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            System Status: <Badge status="success" text={<span style={{color: '#10b981', fontWeight: 600}}>Healthy</span>} />
          </Text>
          <Text type="secondary" style={{ fontSize: '16px' }}>Active Nodes: {applications.length}</Text>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left: Main Feature Card */}
        <Col xs={24} lg={16}>
          <Card style={{ ...glassStyle, height: '400px', padding: '20px' }} bordered={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ 
                  background: '#10b981', color: '#fff', padding: '5px 15px', 
                  borderRadius: '20px', width: 'fit-content', marginBottom: '20px' 
                }}>
                  <ThunderboltFilled /> Smart Control
                </div>
                <Title level={2} style={{ fontSize: '32px', marginTop: 0 }}>Manage your kiosk <br/> ecosystem seamlessly</Title>
                <Text style={{ fontSize: '18px', display: 'block', marginBottom: '30px', opacity: 0.7 }}>
                  All nodes are running smoothly. No issues detected in the last 24 hours.
                </Text>
                <Button type="primary" size="large" icon={<PlayCircleOutlined />} 
                  style={{ borderRadius: '15px', height: '50px', width: '180px', background: '#1e1e1e', border: 'none' }}>
                  Quick Launch
                </Button>
              </div>
              
              {/* Abstract Visual in Card */}
              <div style={{ flex: 0.8, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '200px', height: '200px', background: 'linear-gradient(45deg, #10b981, #3b82f6)', 
                  filter: 'blur(60px)', opacity: 0.3, position: 'absolute' 
                }}></div>
                <Avatar size={200} shape="square" icon={<LaptopOutlined style={{fontSize: '80px'}}/>} 
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
              </div>
            </div>
          </Card>
        </Col>

        {/* Right: Quick Stats/Progress */}
        <Col xs={24} lg={8}>
          <Card style={{ ...glassStyle, height: '400px' }} bordered={false} title="Storage Usage">
            <div style={{ textAlign: 'center', paddingTop: '20px' }}>
              <Progress 
                type="dashboard" 
                percent={75} 
                strokeColor={{ '0%': '#10b981', '100%': '#3b82f6' }}
                strokeWidth={10}
                size={220}
              />
              <div style={{ marginTop: '20px' }}>
                <Title level={4} style={{ margin: 0 }}>75% Capacity</Title>
                <Text type="secondary">32 GB of 64 GB used</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Applications Grid */}
      <div style={{ marginTop: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <Title level={3} style={{ margin: 0 }}>Application Explorer</Title>
          <Button type="link" icon={<ArrowRightOutlined />}>View All</Button>
        </div>
        
        <Row gutter={[24, 24]}>
          {applications.map(app => (
            <Col key={app.id} xs={24} sm={12} lg={6}>
              <Card 
                hoverable 
                style={glassStyle} 
                className="glass-card"
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <Avatar size={50} style={{ background: '#f0fdf4', color: '#10b981' }} icon={<LaptopOutlined />} />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>{app.name}</Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>ID: {app.id}</Text>
                  </div>
                </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Badge status="processing" text="Online" color="#10b981" />
    <Button 
      type="text" 
      shape="circle" 
      icon={<ArrowRightOutlined />} 
      onClick={() => navigate(`/dashboard/client-view/${app.id}`)} // navigation logic ikkada undi
    />
  </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default HomePage;