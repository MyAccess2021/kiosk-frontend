import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Switch, Table, Tag, Tooltip, notification, Spin, Space, Typography, theme, Alert, Checkbox, Radio } from 'antd';
import { AppstoreOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, LockOutlined, EyeOutlined, CameraOutlined, LinkOutlined } from '@ant-design/icons';
import { getApplications, createApplication, updateApplication, deleteApplication } from './services/applicationService';
import { getCameras } from './services/cameraService';
import { assignCameraToApplication, getApplicationCameras, removeApplicationCamera } from './services/applicationCameraService';
import {
  canViewApplication,
  canCreateApplication,
  canUpdateApplication,
  canDeleteApplication
} from './utils/permissions';

const { Title } = Typography;
const { TextArea } = Input;

const ApplicationPage = ({ theme: themeProp }) => {
  const { token } = theme.useToken();
  const [modal, contextHolder] = Modal.useModal();

  const [applications, setApplications] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraAssignModalOpen, setIsCameraAssignModalOpen] = useState(false);
  const [isViewCamerasModalOpen, setIsViewCamerasModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [currentApplicationForCamera, setCurrentApplicationForCamera] = useState(null);
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [primaryCamera, setPrimaryCamera] = useState(null);
  const [viewingApplicationCameras, setViewingApplicationCameras] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [form] = Form.useForm();

  const hasAnyApplicationPermission = canViewApplication() || canCreateApplication() || canUpdateApplication() || canDeleteApplication();

  const fetchApplications = useCallback(async () => {
    if (!canViewApplication()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getApplications();
      const applicationsArray = data?.applications || data || [];
      const finalArray = Array.isArray(applicationsArray) ? applicationsArray : [];
      
      setApplications(finalArray);
    } catch (error) {
      console.error('Fetch error:', error);
      notification.error({
        message: 'Fetch Failed',
        description: error.message || 'Failed to fetch applications.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCameras = useCallback(async () => {
    try {
      const data = await getCameras();
      const camerasArray = data?.cameras || [];
      setCameras(Array.isArray(camerasArray) ? camerasArray : []);
    } catch (error) {
      console.error('Fetch cameras error:', error);
      notification.error({
        message: 'Fetch Failed',
        description: 'Failed to fetch cameras.'
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!canViewApplication()) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [appsData, camerasData] = await Promise.all([
          getApplications(),
          getCameras()
        ]);
        
        if (isMounted) {
          const applicationsArray = appsData?.applications || appsData || [];
          setApplications(Array.isArray(applicationsArray) ? applicationsArray : []);
          
          const camerasArray = camerasData?.cameras || [];
          setCameras(Array.isArray(camerasArray) ? camerasArray : []);
        }
      } catch (error) {
        if (isMounted) {
          notification.error({
            message: 'Fetch Failed',
            description: error.message || 'Failed to fetch data.'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const openModal = (application = null) => {
    if (application && !canUpdateApplication()) {
      notification.warning({
        message: 'Permission Denied',
        description: 'You do not have permission to update applications.',
        icon: <LockOutlined style={{ color: '#faad14' }} />
      });
      return;
    }
    
    if (!application && !canCreateApplication()) {
      notification.warning({
        message: 'Permission Denied',
        description: 'You do not have permission to create applications.',
        icon: <LockOutlined style={{ color: '#faad14' }} />
      });
      return;
    }

    if (application) {
      setEditingApplication(application);
      form.setFieldsValue({
        name: application.name,
        description: application.description,
        publish: application.publish,
        is_active: application.is_active
      });
    } else {
      setEditingApplication(null);
      form.resetFields();
      form.setFieldsValue({ publish: false, is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      let response;
      if (editingApplication) {
        const changedFields = {};
        Object.keys(values).forEach(key => {
          if (values[key] !== editingApplication[key]) {
            changedFields[key] = values[key];
          }
        });
        
        if (Object.keys(changedFields).length === 0) {
          notification.info({
            message: 'No Changes',
            description: 'No fields were modified.'
          });
          setIsModalOpen(false);
          form.resetFields();
          setEditingApplication(null);
          return;
        }
        
        response = await updateApplication(editingApplication.id, changedFields);
        notification.success({
          message: 'Success',
          description: response?.message || 'Application updated successfully!'
        });
        setIsModalOpen(false);
        form.resetFields();
        setEditingApplication(null);
        await fetchApplications();
      } else {
        // Creating new application
        response = await createApplication(values);
        console.log('Create application response:', response); // Debug log
        
        // Try different response formats
        const createdAppId = response?.application?.id || response?.data?.id || response?.id;
        
        console.log('Extracted application ID:', createdAppId); // Debug log
        
        setIsModalOpen(false);
        form.resetFields();
        
        if (createdAppId) {
          // Show camera assignment confirmation dialog
          modal.confirm({
            title: 'Application Created Successfully!',
            content: 'Would you like to assign cameras to this application now?',
            okText: 'Assign Cameras',
            cancelText: 'Skip',
            onOk: () => {
              openCameraAssignModal(createdAppId);
            },
            onCancel: async () => {
              notification.success({
                message: 'Success',
                description: 'Application created successfully! You can assign cameras later.'
              });
              await fetchApplications();
            }
          });
        } else {
          notification.success({
            message: 'Success',
            description: 'Application created successfully!'
          });
          await fetchApplications();
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      
      let errorMessage = 'Failed to save application.';
      let errorDetails = [];
      
      if (typeof error === 'object' && error !== null) {
        Object.keys(error).forEach(field => {
          if (Array.isArray(error[field])) {
            error[field].forEach(msg => {
              errorDetails.push(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${msg}`);
            });
          }
        });
        
        if (errorDetails.length > 0) {
          errorMessage = errorDetails.join('\n');
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      notification.error({
        message: editingApplication ? 'Update Failed' : 'Create Failed',
        description: errorMessage,
        duration: 5
      });
    } finally {
      setLoading(false);
    }
  };

  const openCameraAssignModal = (applicationId) => {
    setCurrentApplicationForCamera(applicationId);
    setSelectedCameras([]);
    setPrimaryCamera(null);
    setIsCameraAssignModalOpen(true);
  };

  const handleCameraAssignCancel = async () => {
    setIsCameraAssignModalOpen(false);
    setSelectedCameras([]);
    setPrimaryCamera(null);
    setCurrentApplicationForCamera(null);
    await fetchApplications();
  };

  const handleCameraSelection = (cameraId, checked) => {
    if (checked) {
      setSelectedCameras([...selectedCameras, cameraId]);
      // If it's the first camera, make it primary by default
      if (selectedCameras.length === 0) {
        setPrimaryCamera(cameraId);
      }
    } else {
      setSelectedCameras(selectedCameras.filter(id => id !== cameraId));
      // If removing the primary camera, reset primary
      if (primaryCamera === cameraId) {
        const remaining = selectedCameras.filter(id => id !== cameraId);
        setPrimaryCamera(remaining.length > 0 ? remaining[0] : null);
      }
    }
  };

  const handlePrimaryCameraChange = (cameraId) => {
    setPrimaryCamera(cameraId);
  };

  const handleAssignCameras = async () => {
    if (selectedCameras.length === 0) {
      notification.warning({
        message: 'No Cameras Selected',
        description: 'Please select at least one camera to assign.'
      });
      return;
    }

    if (!primaryCamera) {
      notification.warning({
        message: 'No Primary Camera',
        description: 'Please select a primary camera.'
      });
      return;
    }

    setAssignLoading(true);
    try {
      // Assign cameras one by one using the service
      const assignPromises = selectedCameras.map(cameraId => {
        const camera = cameras.find(c => c.id === cameraId);
        return assignCameraToApplication({
          application: currentApplicationForCamera,
          camera: cameraId,
          description: camera?.camera_name || '',
          is_primary: cameraId === primaryCamera
        });
      });

      await Promise.all(assignPromises);

      notification.success({
        message: 'Success',
        description: `${selectedCameras.length} camera(s) assigned successfully!`
      });

      setIsCameraAssignModalOpen(false);
      setSelectedCameras([]);
      setPrimaryCamera(null);
      setCurrentApplicationForCamera(null);
      await fetchApplications();
    } catch (error) {
      console.error('Camera assignment error:', error);
      notification.error({
        message: 'Assignment Failed',
        description: error.message || 'Failed to assign cameras.'
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleViewCameras = async (applicationId, applicationName) => {
    setLoading(true);
    try {
      const response = await getApplicationCameras(applicationId);
      console.log('=== VIEW CAMERAS DEBUG ===');
      console.log('Full API response:', JSON.stringify(response, null, 2));
      
      // The API returns { count, links } where links contains the camera assignments
      const camerasData = response?.links || response?.application_cameras || response?.data || [];
      console.log('Extracted cameras data:', camerasData);
      console.log('Number of cameras:', camerasData.length);
      
      setViewingApplicationCameras(Array.isArray(camerasData) ? camerasData : []);
      setCurrentApplicationForCamera(applicationId);
      setIsViewCamerasModalOpen(true);
    } catch (error) {
      console.error('Fetch assigned cameras error:', error);
      notification.error({
        message: 'Fetch Failed',
        description: 'Failed to fetch assigned cameras.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMoreCameras = () => {
    setIsViewCamerasModalOpen(false);
    // Reset selections
    setSelectedCameras([]);
    setPrimaryCamera(null);
    // Open assign modal
    setIsCameraAssignModalOpen(true);
  };

  const handleRemoveAssignedCamera = (assignmentId, cameraName) => {
    modal.confirm({
      title: `Remove ${cameraName}?`,
      content: 'Are you sure you want to remove this camera from the application?',
      okText: 'Remove',
      okType: 'danger',
      onOk: async () => {
        setLoading(true);
        try {
          await removeApplicationCamera(assignmentId);
          notification.success({
            message: 'Success',
            description: 'Camera removed successfully.'
          });
          // Refresh the assigned cameras list
          await handleViewCameras(currentApplicationForCamera);
        } catch (error) {
          console.error('Remove camera error:', error);
          notification.error({
            message: 'Remove Failed',
            description: error.message || 'Failed to remove camera.'
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Filter out already assigned cameras
  const getAvailableCameras = () => {
    if (!currentApplicationForCamera) return cameras;
    
    // Extract camera IDs from the links array (API structure: { camera_details: { id } })
    const assignedCameraIds = viewingApplicationCameras.map(ac => 
      ac.camera_details?.id || ac.camera?.id || ac.camera_id || ac.camera
    );
    console.log('Assigned camera IDs:', assignedCameraIds);
    
    return cameras.filter(camera => !assignedCameraIds.includes(camera.id));
  };

  const handleDelete = (id, name) => {
    if (!canDeleteApplication()) {
      notification.warning({
        message: 'Permission Denied',
        description: 'You do not have permission to delete applications.',
        icon: <LockOutlined style={{ color: '#faad14' }} />
      });
      return;
    }

    modal.confirm({
      title: `Delete ${name}?`,
      content: 'Are you sure you want to delete this application? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        setLoading(true);
        try {
          await deleteApplication(id);
          notification.success({
            message: 'Success',
            description: 'Application deleted successfully.'
          });
          fetchApplications();
        } catch (error) {
          notification.error({
            message: 'Delete Failed',
            description: error.message || 'Failed to delete application.'
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Application Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: 'Published',
      dataIndex: 'publish',
      key: 'publish',
      render: (publish) => (
        <Tag color={publish ? 'success' : 'default'}>
          {publish ? 'Published' : 'Draft'}
        </Tag>
      )
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
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => text ? new Date(text).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : '-'
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (text) => text ? new Date(text).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : '-'
    },
   // In the columns definition, update the Actions column render function:
{
  title: 'Actions',
  key: 'actions',
  fixed: 'right',
  width: 150,
  render: (_, record) => (
    <Space>
      <Tooltip 
        title="View/Manage Cameras" 
        overlayInnerStyle={{ color: token.colorText }}
        open={isViewCamerasModalOpen && currentApplicationForCamera === record.id ? false : undefined}
      >
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewCameras(record.id, record.name)}
        />
      </Tooltip>
      {canUpdateApplication() && (
        <Tooltip title="Edit" overlayInnerStyle={{ color: token.colorText }}>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openModal(record)}
          />
        </Tooltip>
      )}
      {canDeleteApplication() && (
        <Tooltip title="Delete" overlayInnerStyle={{ color: token.colorText }}>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id, record.name)}
          />
        </Tooltip>
      )}
    </Space>
  )
},
  ];

  const viewCamerasColumns = [
    {
      title: 'Camera Name',
      key: 'camera_name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {record.camera_details?.camera_name || record.camera_name || 'Unknown Camera'}
          </div>
          {record.is_primary && (
            <Tag color="blue" style={{ marginTop: 4 }}>Primary</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Description',
      key: 'description',
      render: (_, record) => 
        record.description || record.camera_details?.description || '-'
    },
    {
      title: 'Status',
      key: 'is_active',
      render: (_, record) => {
        const isActive = record.camera_details?.is_active !== undefined 
          ? record.camera_details.is_active 
          : record.is_active;
        return (
          <Tag color={isActive ? 'success' : 'error'}>
            {isActive ? 'Active' : 'Inactive'}
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Tooltip title="Remove Camera" overlayInnerStyle={{ color: token.colorText }}>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleRemoveAssignedCamera(
              record.id, 
              record.camera_details?.camera_name || record.camera_name || 'Camera'
            )}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div>
      {contextHolder}

      <Title level={3} style={{ marginBottom: 24 }}>
        Application Management
      </Title>

      {!hasAnyApplicationPermission ? (
        <Alert
          message="Permission Denied"
          description="You do not have any permissions to manage or view applications."
          type="error"
          showIcon
          icon={<LockOutlined />}
        />
      ) : (
        <>
          {canViewApplication() ? (
            <>
              <Space direction="vertical" style={{ marginBottom: 16, width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <Title level={4} style={{ margin: 0 }}>All Applications</Title>
                  <Space wrap>
                    <Button 
                      icon={<ReloadOutlined spin={loading} />} 
                      onClick={fetchApplications} 
                      disabled={loading}
                    >
                      Refresh
                    </Button>
                    {canCreateApplication() && (
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => openModal()}
                      >
                        Add New Application
                      </Button>
                    )}
                  </Space>
                </div>
              </Space>

              <Table
                columns={columns}
                dataSource={applications}
                rowKey="id"
                loading={loading}
                pagination={{ 
                  pageSize: 10, 
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} applications`
                }}
                scroll={{ x: true }}
              />
            </>
          ) : (
            <Alert
              message="Permission Denied"
              description="You do not have permission to view applications."
              type="warning"
              showIcon
              icon={<LockOutlined />}
            />
          )}
        </>
      )}

      {/* Application Form Modal */}
      <Modal
        title={editingApplication ? 'Edit Application' : 'Add New Application'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Spin spinning={loading}>
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleFormSubmit} 
            style={{ marginTop: 24 }}
          >
            <Form.Item
              name="name"
              label="Application Name"
              rules={[
                { required: true, message: 'Please enter application name' },
                { max: 100, message: 'Name cannot exceed 100 characters' }
              ]}
            >
              <Input placeholder="e.g., Smart Kiosk 1" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { max: 500, message: 'Description cannot exceed 500 characters' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Describe the application's purpose and features..." 
              />
            </Form.Item>

            <Form.Item
              name="publish"
              label="Publish Application"
              valuePropName="checked"
              tooltip="Published applications are visible to end users"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Activate Application"
              valuePropName="checked"
              tooltip="Only active applications can be used"
            >
              <Switch />
            </Form.Item>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Space>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingApplication ? 'Update' : 'Create'}
                </Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Modal>

      {/* Camera Assignment Modal */}
      <Modal
        title={
          <Space>
            <CameraOutlined />
            <span>Assign Cameras to Application</span>
          </Space>
        }
        open={isCameraAssignModalOpen}
        onCancel={handleCameraAssignCancel}
        width={700}
        footer={[
          <Button key="skip" onClick={handleCameraAssignCancel}>
            {currentApplicationForCamera ? 'Cancel' : 'Skip'}
          </Button>,
          <Button
            key="assign"
            type="primary"
            loading={assignLoading}
            onClick={handleAssignCameras}
            disabled={selectedCameras.length === 0}
          >
            Assign Cameras
          </Button>
        ]}
      >
        <Spin spinning={assignLoading}>
          <div style={{ marginTop: 24 }}>
            {getAvailableCameras().length === 0 ? (
              <Alert
                message="No Cameras Available"
                description={currentApplicationForCamera && viewingApplicationCameras.length > 0 
                  ? "All available cameras are already assigned to this application." 
                  : "There are no cameras available to assign. Please add cameras first."}
                type="info"
                showIcon
              />
            ) : (
              <>
                <Alert
                  message="Select Cameras"
                  description="Choose one or more cameras to assign. You must select a primary camera."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {getAvailableCameras().map(camera => (
                    <div
                      key={camera.id}
                      style={{
                        padding: 16,
                        marginBottom: 12,
                        border: `1px solid ${selectedCameras.includes(camera.id) ? token.colorPrimary : token.colorBorder}`,
                        borderRadius: 8,
                        backgroundColor: selectedCameras.includes(camera.id) ? `${token.colorPrimary}10` : 'transparent',
                        transition: 'all 0.3s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <Checkbox
                            checked={selectedCameras.includes(camera.id)}
                            onChange={(e) => handleCameraSelection(camera.id, e.target.checked)}
                            style={{ marginBottom: 8 }}
                          >
                            <strong>{camera.camera_name}</strong>
                          </Checkbox>
                          <div style={{ marginLeft: 24, fontSize: 13, color: token.colorTextSecondary }}>
                            {camera.description || 'No description'}
                          </div>
                          <div style={{ marginLeft: 24, marginTop: 4 }}>
                            <Tag color={camera.is_active ? 'success' : 'error'}>
                              {camera.is_active ? 'Active' : 'Inactive'}
                            </Tag>
                          </div>
                        </div>
                        {selectedCameras.includes(camera.id) && (
                          <Radio
                            checked={primaryCamera === camera.id}
                            onChange={() => handlePrimaryCameraChange(camera.id)}
                            style={{ marginLeft: 16 }}
                          >
                            Primary
                          </Radio>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedCameras.length > 0 && (
                  <Alert
                    message={`${selectedCameras.length} camera(s) selected${primaryCamera ? '. Primary camera set.' : '. Please select a primary camera.'}`}
                    type={primaryCamera ? 'success' : 'warning'}
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
              </>
            )}
          </div>
        </Spin>
      </Modal>

      {/* View Assigned Cameras Modal */}
      <Modal
        title={
          <Space>
            <CameraOutlined />
            <span>Assigned Cameras</span>
          </Space>
        }
        open={isViewCamerasModalOpen}
        onCancel={() => {
          setIsViewCamerasModalOpen(false);
          setCurrentApplicationForCamera(null);
        }}
        footer={[
          <Button 
            key="assign" 
            type="primary" 
            icon={<LinkOutlined />}
            onClick={handleAssignMoreCameras}
          >
            Assign More Cameras
          </Button>,
          <Button 
            key="close" 
            onClick={() => {
              setIsViewCamerasModalOpen(false);
              setCurrentApplicationForCamera(null);
            }}
          >
            Close
          </Button>
        ]}
        width={800}
      >
        <Spin spinning={loading}>
          {viewingApplicationCameras.length === 0 ? (
            <Alert
              message="No Cameras Assigned"
              description="This application has no cameras assigned yet. Click 'Assign More Cameras' to add cameras."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          ) : (
            <Table
              columns={viewCamerasColumns}
              dataSource={viewingApplicationCameras}
              rowKey="id"
              pagination={false}
              style={{ marginTop: 16 }}
            />
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default ApplicationPage;