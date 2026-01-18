// ClientView.jsx
import React from 'react';
import { Row, Col, Typography, Card, Button, Avatar, Badge, Space } from 'antd';
import { 
  MenuOutlined, 
  ArrowLeftOutlined, 
  ArrowRightOutlined, 
  BellOutlined, 
  SettingOutlined,
  ThunderboltFilled,
  UserOutlined,
  PhoneOutlined,
  LaptopOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ClientView = ({ theme }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // HomePage lo unna same Universal Glass Style ikkada apply cheshanu
  const glassStyle = {
    background: theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.03)' 
      : 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '24px', // layout ki thaggattu konchem roundness adjust cheshanu
    border: theme === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.08)'
      : '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    height: '100%'
  };

  const textPrimary = theme === 'dark' ? '#fff' : '#111827';

  // --- SVG Charts (Exactly as they were) ---
  const OrangeWave = () => (
    <svg viewBox="0 0 100 40" style={{width: '100%', height: '80px', marginTop: 'auto', display: 'block'}}>
      <path d="M0,35 Q20,32 40,25 T100,5 V40 H0 Z" fill="url(#orangeGradient)" opacity="0.8" />
      <path d="M0,35 Q20,32 40,25 T100,5" fill="none" stroke="#F97316" strokeWidth="2" />
      <defs>
        <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB923C" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#FB923C" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );

  const GreenWave = () => (
    <svg viewBox="0 0 100 40" style={{width: '100%', height: '80px', marginTop: 'auto', display: 'block'}}>
      <path d="M0,5 Q30,35 60,30 T100,38 V40 H0 Z" fill="url(#greenGradient)" opacity="0.8" />
      <path d="M0,5 Q30,35 60,30 T100,38" fill="none" stroke="#10B981" strokeWidth="2" />
      <defs>
        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#34D399" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: 'transparent' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            style={{ ...glassStyle, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
          />
        </div>

        {/* Center Pill Nav */}
        <div style={{ ...glassStyle, padding: '5px 10px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', height: 'auto' }}>
          <div style={{ background: '#111827', color: 'white', padding: '4px 16px', borderRadius: '15px', fontSize: '12px', fontWeight: 600 }}>
            Cameras
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
           <Button icon={<BellOutlined />} style={{ ...glassStyle, width: '40px', height: '40px', borderRadius: '50%' }} />
        </div>
      </div>

      {/* 2. Main Title Section */}
      <Row gutter={[30, 30]}>
        <Col xs={24} lg={12}>
          <div style={{ marginBottom: '30px' }}>
            <Title level={1} style={{ margin: '0 0 10px 0', fontSize: '42px', fontWeight: 700, letterSpacing: '-1px', color: textPrimary }}>
              Vending Machine Anyaltics
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              West Sacramento, CA 95691, Business Central Office Park
            </Text>
          </div>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card style={glassStyle} bodyStyle={{ padding: '20px' }}>
                <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><LaptopOutlined /> Display </Text>
                <p style={{ fontSize: '24px', fontWeight: 700, color: textPrimary, margin: 0 }}>322,471</p>
              </Card>
            </Col>
            <Col span={12}>
              <Card style={glassStyle} bodyStyle={{ padding: '20px' }}>
                <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><EnvironmentOutlined /> Temperature</Text>
                <p style={{ fontSize: '24px', fontWeight: 700, color: textPrimary, margin: 0 }}>179.49</p>
              </Card>
            </Col>
            <Col span={8}>
              <Card style={glassStyle} bodyStyle={{ padding: '20px' }}>
                <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600 }}>% Humidity</Text>
                <p style={{ fontSize: '24px', fontWeight: 700, color: textPrimary, margin: 0 }}>9.6%</p>
              </Card>
            </Col>
            <Col span={8}>
               <Card style={glassStyle} bodyStyle={{ padding: '20px' }}>
                <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600 }}>Current Balance</Text>
                <p style={{ fontSize: '24px', fontWeight: 700, color: textPrimary, margin: 0 }}>$34.7m</p>
              </Card>
            </Col>
             <Col span={8}>
               <Card style={glassStyle} bodyStyle={{ padding: '20px' }}>
                <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{width: 8, height: 8, background: '#10B981', borderRadius: '50%'}}/> Cap Rate
                </Text>
                <p style={{ fontSize: '24px', fontWeight: 700, color: textPrimary, margin: 0 }}>5.1%</p>
              </Card>
            </Col>
          </Row>

          <div style={{ marginTop: '40px', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Button style={{ background: '#111827', color: 'white', borderRadius: '20px', padding: '8px 24px', border: 'none', height: 'auto', fontWeight: 600 }}>Buttons</Button>
            <Button type="text" style={{ color: '#6B7280', fontWeight: 600 }}>Device Performance</Button>
            <Button type="text" style={{ color: '#6B7280', fontWeight: 600 }}>Logs</Button>
          </div>
        </Col>

        {/* Right Side: Image with Floating Cards */}
        <Col xs={24} lg={12}>
          <div style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-6ad4c727dd2d?q=80&w=2075&auto=format&fit=crop")',
            backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '30px', height: '450px', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '25%', right: '10%', ...glassStyle, height: 'auto', padding: '15px', width: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <ThunderboltFilled style={{ color: textPrimary }} /> 
                <Text strong style={{fontSize: '12px', color: textPrimary}}>Energy Efficiency</Text>
              </div>
              <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>Estimated Data Efficency</Text>
              <Text strong style={{ fontSize: '18px', display: 'block', marginBottom: '10px', color: textPrimary }}>$1,200</Text>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <Text style={{fontSize: '10px', color: '#666'}}>Windows</Text>
                 <Text strong style={{fontSize: '10px', color: textPrimary}}>Triple-Pane</Text>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: '15%', right: '5%', ...glassStyle, height: 'auto', padding: '15px' }}>
              <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '10px', color: textPrimary }}>👤 Stakeholders</Text>
              <Avatar.Group maxCount={3} size="small">
                <Avatar src="https://i.pravatar.cc/150?u=1" />
                <Avatar src="https://i.pravatar.cc/150?u=2" />
                <Avatar src="https://i.pravatar.cc/150?u=3" />
                <Avatar style={{ backgroundColor: '#111827' }}>+2</Avatar>
              </Avatar.Group>
            </div>
          </div>
        </Col>
      </Row>

      {/* 3. Bottom Cards Section */}
      <Row gutter={[20, 20]} style={{ marginTop: '30px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={glassStyle} bodyStyle={{ padding: '20px', height: '220px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <Text strong style={{color: textPrimary}}>📶 Bar Graph</Text>
                <Text type="warning" style={{fontSize: '12px'}}>● Average Risk</Text>
            </div>
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Text type="secondary" style={{fontSize: '12px'}}>Portfolio Threshold</Text>
                <Title level={3} style={{margin: 0, color: textPrimary}}>49%</Title>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
                <OrangeWave />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
            <Card style={glassStyle} bodyStyle={{ padding: '20px', height: '220px' }}>
              <Text strong style={{color: textPrimary}}>🛡 Risk Rating</Text>
              <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <Text type="secondary" style={{fontSize: '12px'}}>Base Scenario</Text>
                 <Title level={1} style={{margin: '5px 0', fontSize: '48px', fontWeight: 300, color: textPrimary}}>5</Title>
                 <Text strong style={{color: textPrimary}}>Average</Text>
              </div>
            </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
            <Card style={glassStyle} bodyStyle={{ padding: '20px', height: '220px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
             <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <Text strong style={{color: textPrimary}}>📊 Bar Graph</Text>
                <Text type="success" style={{fontSize: '12px'}}>● Low Risk</Text>
            </div>
             <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Text type="secondary" style={{fontSize: '12px'}}>Portfolio Threshold</Text>
                <Title level={3} style={{margin: 0, color: textPrimary}}>1.25</Title>
            </div>
             <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
                <GreenWave />
            </div>
            </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
            <Card style={glassStyle} bodyStyle={{ padding: '20px', height: '220px' }}>
             <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                <Text strong style={{color: textPrimary}}>👤 Log Viewer</Text>
                <Text type="warning" style={{fontSize: '12px'}}>● Average Risk</Text>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <Avatar size={64} shape="square" src="https://i.pravatar.cc/150?u=60" style={{borderRadius: '12px'}} />
                <div>
                    <Text type="secondary" style={{fontSize: '12px'}}>Borrower</Text>
                    <Title level={5} style={{margin: 0, color: textPrimary}}>Scott Seligman</Title>
                    <div style={{marginTop: '5px', fontSize: '11px', color: '#666'}}>
                        <PhoneOutlined /> +1 705 555-1207
                    </div>
                </div>
            </div>
            </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClientView;