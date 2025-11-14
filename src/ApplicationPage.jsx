import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Switch, Table, Tag, Tooltip, notification, Spin, Space, Typography, theme, Alert } from 'antd';
import { AppstoreOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, LockOutlined } from '@ant-design/icons';
import { getApplications, createApplication, updateApplication, deleteApplication } from './services/applicationService';
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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [form] = Form.useForm();

  const hasAnyApplicationPermission = canViewApplication() || canCreateApplication() || canUpdateApplication() || canDeleteApplication();

  const fetchApplications = useCallback(async () => {
    // We can only fetch applications if the user has view permission
    if (!canViewApplication()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getApplications();
      // API returns {count: 2, applications: [...]} format
      const applicationsArray = data?.applications || data || [];
      const finalArray = Array.isArray(applicationsArray) ? applicationsArray : [];
      
      setApplications(finalArray);
    } catch (error) {
      console.error('Fetch error:', error); // Debug log
      notification.error({
        message: 'Fetch Failed',
        description: error.message || 'Failed to fetch applications.'
      });
    } finally {
      setLoading(false);
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
        const data = await getApplications();
        // Only update state if component is still mounted
        if (isMounted) {
          const applicationsArray = data?.applications || data || [];
          setApplications(Array.isArray(applicationsArray) ? applicationsArray : []);
        }
      } catch (error) {
        if (isMounted) {
          notification.error({
            message: 'Fetch Failed',
            description: error.message || 'Failed to fetch applications.'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Cleanup function
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
        
        
        // For PATCH: Only send changed fields
        const changedFields = {};
        Object.keys(values).forEach(key => {
          if (values[key] !== editingApplication[key]) {
            changedFields[key] = values[key];
          }
        });
        
       
        
        // If no fields changed, just close modal
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
      } else {
       
        response = await createApplication(values);
        notification.success({
          message: 'Success',
          description: response?.message || 'Application created successfully!'
        });
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingApplication(null);
      // Fetch fresh data after create/update
      await fetchApplications();
    } catch (error) {
      console.error('Submit error:', error);
      
      // Handle validation errors from backend
      let errorMessage = 'Failed to save application.';
      let errorDetails = [];
      
      if (typeof error === 'object' && error !== null) {
        // Collect all field errors
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
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
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
                <Button type="primary" htmlType="submit">
                  {editingApplication ? 'Update' : 'Create'}
                </Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default ApplicationPage;