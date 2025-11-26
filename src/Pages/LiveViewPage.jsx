import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Select, Switch, Table, Tag, Tooltip, notification, Spin, Empty, Tabs, Space, Typography, theme, Row, Col, Alert } from 'antd';
import { VideoCameraOutlined, UnorderedListOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import { getCameras, createCamera, updateCamera, deleteCamera } from '../services/cameraService';
import {
  canViewCamera,
  canCreateCamera,
  canUpdateCamera,
  canDeleteCamera
} from '../utils/permissions';

const { Option } = Select;
const { Title } = Typography;

const LiveViewPage = ({ theme: themeProp }) => {
  const { token } = theme.useToken();
  const [modal, contextHolder] = Modal.useModal();

  // Determine the default tab based on permissions
  const getDefaultTab = () => {
    if (canViewCamera()) {
      return 'view'; // If user can view, show the live view first.
    }
    // If they can do any management action, show the list view.
    if (canCreateCamera() || canUpdateCamera() || canDeleteCamera()) {
      return 'manage';
    }
    return 'view'; // Fallback to view
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab);
  const [allCameras, setAllCameras] = useState([]);
  const [liveCameras, setLiveCameras] = useState([]);
  const [selectedStreamIndex, setSelectedStreamIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [form] = Form.useForm();

  const hasAnyCameraPermission = canViewCamera() || canCreateCamera() || canUpdateCamera() || canDeleteCamera();

  const fetchData = useCallback(async () => {
    // We can only fetch camera lists if the user has view permission.
    if (!canViewCamera()) {
      setLoading(false);
      return;
    }
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
    if (camera && !canUpdateCamera()) {
      notification.warning({
        message: 'Permission Denied',
        description: 'You do not have permission to update cameras.',
        icon: <LockOutlined style={{ color: '#faad14' }} />
      });
      return;
    }
    
    if (!camera && !canCreateCamera()) {
      notification.warning({
        message: 'Permission Denied',
        description: 'You do not have permission to create cameras.',
        icon: <LockOutlined style={{ color: '#faad14' }} />
      });
      return;
    }

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

  const handleDelete = (id, name) => {
    if (!canDeleteCamera()) {
      notification.warning({
        message: 'Permission Denied',
        description: 'You do not have permission to delete cameras.',
        icon: <LockOutlined style={{ color: '#faad14' }} />
      });
      return;
    }

    modal.confirm({
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

  const handleViewCamera = (camera) => {
    const liveCameraIndex = liveCameras.findIndex(c => c.id === camera.id);
    if (liveCameraIndex !== -1) {
      setActiveTab('view');
      setSelectedStreamIndex(liveCameraIndex);
    } else {
      notification.info({
        message: 'Camera Not Active',
        description: 'This camera is not currently active. Please activate it to view the live stream.',
      });
    }
  };

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
          <Tooltip title="View" overlayInnerStyle={{ color: token.colorText }}>
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewCamera(record)}
              disabled={!record.is_active}
            />
          </Tooltip>
          {canUpdateCamera() && (
            <Tooltip title="Edit" overlayInnerStyle={{ color: token.colorText }}>
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => openModal(record)}
              />
            </Tooltip>
          )}
          {canDeleteCamera() && (
            <Tooltip title="Delete" overlayInnerStyle={{ color: token.colorText }}>
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                onClick={() => handleDelete(record.id, record.camera_name)}
              />
            </Tooltip>
          )}
        </Space>
      )
    },
  ];

  const renderLiveView = () => {
    if (!canViewCamera()) {
      return (
        <Alert
          message="Permission Denied"
          description="You do not have permission to view live camera streams."
          type="warning"
          showIcon
          icon={<LockOutlined />}
          style={{ marginTop: 24 }}
        />
      );
    }
    
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
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={otherCameras.length > 0 ? 18 : 24}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', backgroundColor: '#000', flex: 1, minHeight: '400px' }}>
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
        </Col>

        {otherCameras.length > 0 && (
          <Col xs={24} lg={6}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
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
          </Col>
        )}
      </Row>
    );
  };

  const renderCameraList = () => {
    return (
      <div>
        <Space direction="vertical" style={{ marginBottom: 16, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>All Registered Cameras</Title>
            <Space wrap>
              {canViewCamera() && (
                <Button icon={<ReloadOutlined spin={loading} />} onClick={fetchData} disabled={loading}>
                  Refresh
                </Button>
              )}
              {canCreateCamera() && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                  Add Camera
                </Button>
              )}
            </Space>
          </div>
        </Space>

        {canViewCamera() ? (
          <Table
            columns={columns}
            dataSource={allCameras}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: true }}
          />
        ) : (
          <Alert
            message="Permission Denied"
            description="You do not have permission to view the list of cameras."
            type="info"
            showIcon
            style={{ marginTop: '16px' }}
          />
        )}
      </div>
    );
  };

  const tabItems = [
    { key: 'view', label: <span><VideoCameraOutlined />Live View</span>, children: renderLiveView() },
    { key: 'manage', label: <span><UnorderedListOutlined />Camera List</span>, children: renderCameraList() },
  ];

  if (!hasAnyCameraPermission) {
    return (
      <div>
        <Title level={3} style={{ marginBottom: 24 }}>
          Camera System
        </Title>
        <Alert
          message="Permission Denied"
          description="You do not have any permissions to manage or view cameras."
          type="error"
          showIcon
          icon={<LockOutlined />}
        />
      </div>
    );
  }

  return (
    <div>
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
              <Input placeholder="e.g., Entrance Cam" />
            </Form.Item>
            <Form.Item name="model_number" label="Model Number">
              <Input placeholder="e.g., Hikvision DS-2CD1023" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Describe the camera's location..." />
            </Form.Item>
            <Form.Item name="protocol" label="Protocol" rules={[{ required: true }]}>
              <Select>
                <Option value="rtsp">RTSP</Option>
                <Option value="http">HTTP</Option>
                <Option value="https">HTTPS</Option>
              </Select>
            </Form.Item>
            <Form.Item name="stream_path" label="Stream Path" rules={[{ required: true }]}>
              <Input placeholder="e.g., /stream1" />
            </Form.Item>
            <Form.Item name="url" label="Camera URL" rules={[{ required: true }]}>
              <Input placeholder="rtsp://user:pass@192.168.1.108:554/" />
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