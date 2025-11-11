import React, { useState, useEffect, useCallback } from 'react';
// --- STEP 1: ADD 'theme' TO THE IMPORT ---
import { Button, Modal, Form, Input, Select, Switch, Table, Tag, Tooltip, notification, Spin, Empty, Tabs, Space, Typography, theme } from 'antd';
import { VideoCameraOutlined, UnorderedListOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { getCameras, createCamera, updateCamera, deleteCamera } from './services/cameraService';

const { Option } = Select;
const { Title } = Typography;

const LiveViewPage = ({ theme: themeProp }) => { // Renamed prop to avoid conflict
  // --- STEP 2: INITIALIZE THE HOOKS ---
  const { token } = theme.useToken();
  const [modal, contextHolder] = Modal.useModal();

  const [activeTab, setActiveTab] = useState('view');
  const [allCameras, setAllCameras] = useState([]);
  const [liveCameras, setLiveCameras] = useState([]);
  const [selectedStreamIndex, setSelectedStreamIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allData, liveData] = await Promise.all([
        getCameras(), 
        getCameras(true)
      ]);
      setAllCameras(allData.cameras || []);
      setLiveCameras(liveData.cameras || []);
      if ((liveData.cameras || []).length > 0) {
        setSelectedStreamIndex(0);
      }
    } catch (error) {
      notification.error({ 
        message: 'Fetch Failed', 
        description: error.message || 'Failed to fetch camera data.' 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = (camera = null) => {
    if (camera) {
      setEditingCamera(camera);
      form.setFieldsValue(camera);
    } else {
      setEditingCamera(null);
      form.resetFields();
      form.setFieldsValue({ protocol: 'rtsp', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => setIsModalOpen(false);

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingCamera) {
        await updateCamera(editingCamera.id, values);
        notification.success({ 
          message: 'Success', 
          description: 'Camera updated successfully!' 
        });
      } else {
        await createCamera(values);
        notification.success({ 
          message: 'Success', 
          description: 'Camera added successfully!' 
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      notification.error({ 
        message: 'Save Failed', 
        description: error.message || 'Failed to save camera.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 3: UPDATE handleDelete TO USE 'modal.confirm' ---
  const handleDelete = (id, name) => {
    modal.confirm({ // Changed from Modal.confirm
      title: `Delete ${name}?`,
      content: 'Are you sure you want to delete this camera? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        setLoading(true);
        try {
          await deleteCamera(id);
          notification.success({ 
            message: 'Success', 
            description: 'Camera deleted successfully.' 
          });
          fetchData();
        } catch (error) {
          notification.error({ 
            message: 'Delete Failed', 
            description: error.message || 'Failed to delete camera.' 
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };
  
  // --- STEP 4: UPDATE TOOLTIPS WITH DYNAMIC COLOR ---
  const columns = [
    { 
      title: 'Camera Name', 
      dataIndex: 'camera_name', 
      key: 'camera_name', 
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {record.model_number}
          </div>
        </div>
      )
    },
    { 
      title: 'Stream URL', 
      dataIndex: 'url', 
      key: 'url', 
      ellipsis: true 
    },
    { 
      title: 'Status', 
      dataIndex: 'is_active', 
      key: 'is_active', 
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit" overlayInnerStyle={{ color: token.colorText }}>
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => openModal(record)} 
            />
          </Tooltip>
          <Tooltip title="Delete" overlayInnerStyle={{ color: token.colorText }}>
            <Button 
              icon={<DeleteOutlined />} 
              size="small"
              danger 
              onClick={() => handleDelete(record.id, record.camera_name)} 
            />
          </Tooltip>
        </Space>
      )
    },
  ];

  // (The rest of the file is unchanged, but included for completeness)

  const renderLiveView = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Spin size="large" />
        </div>
      );
    }
    
    if (liveCameras.length === 0) {
      return (
        <Empty 
          image={<VideoCameraOutlined style={{ fontSize: 64 }} />}
          description="No Active Cameras Available"
          style={{ marginTop: 80 }}
        />
      );
    }

    const selectedCam = liveCameras[selectedStreamIndex];
    const otherCameras = liveCameras.filter((_, idx) => idx !== selectedStreamIndex);

    return (
      <div style={{ display: 'flex', gap: 16, minHeight: 'calc(100vh - 280px)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', backgroundColor: '#000', flex: 1 }}>
            <iframe 
              key={selectedCam.id} 
              src={selectedCam.webrtc_url} 
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media; picture-in-picture" 
              title={selectedCam.camera_name} 
            />
          </div>
          <div style={{ marginTop: 12, padding: '0 4px' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: 18, margin: 0 }}>
              {selectedCam.camera_name}
            </h3>
            <p style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>
              {selectedCam.description || 'No description'}
            </p>
          </div>
        </div>

        {otherCameras.length > 0 && (
          <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
            {otherCameras.map((camera) => {
              const actualIndex = liveCameras.findIndex(c => c.id === camera.id);
              return (
                <div 
                  key={camera.id} 
                  onClick={() => setSelectedStreamIndex(actualIndex)} 
                  style={{ borderRadius: 8, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', border: `2px solid ${themeProp === 'light' ? '#e5e7eb' : '#374151'}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = themeProp === 'light' ? '#6366f1' : '#818cf8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = themeProp === 'light' ? '#e5e7eb' : '#374151'; }}
                >
                  <div style={{ position: 'relative', backgroundColor: '#000', aspectRatio: '16/9' }}>
                    <iframe 
                      src={camera.webrtc_url} 
                      style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                      title={`Preview of ${camera.camera_name}`} 
                    />
                  </div>
                  <div style={{ padding: 12, backgroundColor: themeProp === 'light' ? '#f9fafb' : '#1f2937' }}>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {camera.camera_name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderCameraList = () => (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>All Registered Cameras</Title>
        <Space>
          <Button icon={<ReloadOutlined spin={loading} />} onClick={fetchData} disabled={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Add Camera
          </Button>
        </Space>
      </Space>
      <Table 
        columns={columns} 
        dataSource={allCameras} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </div>
  );

  const tabItems = [
    { key: 'view', label: <span><VideoCameraOutlined />Live View</span>, children: renderLiveView() },
    { key: 'manage', label: <span><UnorderedListOutlined />Camera List</span>, children: renderCameraList() },
  ];
  
  return (
    <div>
      {/* --- STEP 5: RENDER THE CONTEXT HOLDER --- */}
      {contextHolder}

      <Title level={3} style={{ marginBottom: 24 }}>
        Camera System
      </Title>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal 
        title={editingCamera ? 'Edit Camera' : 'Add New Camera'} 
        open={isModalOpen} 
        onCancel={handleCancel} 
        footer={null}
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" onFinish={handleFormSubmit} style={{ marginTop: 24 }}>
            <Form.Item name="camera_name" label="Camera Name" rules={[{ required: true, message: 'Please enter camera name' }]}>
              <Input placeholder="e.g., Entrance Cam"/>
            </Form.Item>
            <Form.Item name="model_number" label="Model Number">
              <Input placeholder="e.g., Hikvision DS-2CD1023"/>
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Describe the camera's location..."/>
            </Form.Item>
            <Form.Item name="protocol" label="Protocol" rules={[{ required: true }]}>
              <Select>
                <Option value="rtsp">RTSP</Option>
                <Option value="http">HTTP</Option>
                <Option value="https">HTTPS</Option>
              </Select>
            </Form.Item>
            <Form.Item name="stream_path" label="Stream Path" rules={[{ required: true }]}>
              <Input placeholder="e.g., /stream1"/>
            </Form.Item>
            <Form.Item name="url" label="Camera URL" rules={[{ required: true }]}>
              <Input placeholder="rtsp://user:pass@192.168.1.108:554/"/>
            </Form.Item>
            <Form.Item name="is_active" label="Activate Camera" valuePropName="checked">
              <Switch />
            </Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  {editingCamera ? 'Update' : 'Create'}
                </Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default LiveViewPage;