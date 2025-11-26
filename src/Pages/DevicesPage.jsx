// FILE: DevicesPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Modal,
  Form,
  Switch,
  notification,
} from 'antd';
import {
  HddOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
} from '../services/deviceService';
import { getApplications } from '../services/applicationService';
import JsonBuilderComponent from './JsonBuilderComponent';

const { Title } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

const DevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  // Device Modal State
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deviceSubmitting, setDeviceSubmitting] = useState(false);
  const [deviceForm] = Form.useForm();
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null); // null = create, not null = edit
  const [showJsonBuilder, setShowJsonBuilder] = useState(false);
const [payloadObj, setPayloadObj] = useState({});


  // ======== LOADERS ========

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await getDevices('');
      const list = data?.devices || data || [];
      setDevices(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      notification.error({
        message: 'Failed to Load Devices',
        description: err.message || 'Could not fetch devices.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const data = await getApplications();
      const list = data?.applications || data || [];
      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      notification.error({
        message: 'Failed to Load Applications',
        description: err.message || 'Could not fetch applications.',
      });
    }
  };

  useEffect(() => {
    loadDevices();
    loadApplications();
  }, []);

  // ======== FILTERED LIST ========

  const filteredDevices = devices.filter((d) =>
    (d.device_name || '')
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    (d.device_uid || '')
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // ======== FORM SUBMIT (CREATE / EDIT) ========

 const handleDeviceSubmit = async (values) => {
  if (!selectedAppId) {
    notification.error({
      message: 'Application Required',
      description: 'Please select an application for this device.',
    });
    return;
  }

  // Use payloadObj from state directly - it's already in correct format
  const body = {
    application: selectedAppId,
    device_uid: values.device_uid,
    device_name: values.device_name,
    description: values.description || '',
    protocol: values.protocol || 'websocket',
    firmware_version: values.firmware_version || '',
    development_enabled:
      typeof values.development_enabled === 'boolean'
        ? values.development_enabled
        : true,
    is_active:
      typeof values.is_active === 'boolean'
        ? values.is_active
        : true,
    // Use payloadObj directly if it has content
    ...(payloadObj && Object.keys(payloadObj).length > 0 ? { payload: payloadObj } : {}),
  };

  setDeviceSubmitting(true);
  try {
    if (editingDevice) {
      // UPDATE
      await updateDevice(editingDevice.id, body);
      notification.success({
        message: 'Device Updated',
        description: 'Device updated successfully.',
      });
    } else {
      // CREATE
      await createDevice(body);
      notification.success({
        message: 'Device Created',
        description: 'Device created successfully.',
      });
    }

    setIsDeviceModalOpen(false);
    deviceForm.resetFields();
    setPayloadObj({}); // Reset payload
    setSelectedAppId(null);
    setEditingDevice(null);
    loadDevices();
  } catch (err) {
    console.error(err);
    notification.error({
      message: editingDevice ? 'Update Failed' : 'Create Failed',
      description: err.message || 'Operation failed.',
    });
  } finally {
    setDeviceSubmitting(false);
  }
};

  // ======== OPEN MODAL (CREATE / EDIT) ========

  const openCreateModal = () => {
    setEditingDevice(null);
    setSelectedAppId(null);
    deviceForm.resetFields();
    setIsDeviceModalOpen(true);
  };
const openEditModal = (device) => {
  setEditingDevice(device);
  setSelectedAppId(device.application || null);

  // Set the payloadObj state if device has payload
  if (device.payload && typeof device.payload === 'object') {
    setPayloadObj(device.payload);
  } else {
    setPayloadObj({});
  }

  deviceForm.setFieldsValue({
    device_uid: device.device_uid,
    device_name: device.device_name,
    description: device.description,
    protocol: device.protocol,
    firmware_version: device.firmware_version,
    development_enabled: device.development_enabled,
    is_active: device.is_active,
  });

  setIsDeviceModalOpen(true);
};

  // ======== DELETE DEVICE ========

  const handleDeleteDevice = (device) => {
    confirm({
      title: `Delete device "${device.device_name}"?`,
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await deleteDevice(device.id);
          notification.success({
            message: 'Device Deleted',
            description: `Device "${device.device_name}" deleted successfully.`,
          });
          loadDevices();
        } catch (err) {
          console.error(err);
          notification.error({
            message: 'Delete Failed',
            description: err.message || 'Could not delete device.',
          });
        }
      },
    });
  };

  // ======== TABLE COLUMNS ========

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'UID',
      dataIndex: 'device_uid',
      key: 'device_uid',
    },
    {
      title: 'Device Name',
      dataIndex: 'device_name',
      key: 'device_name',
    },
    {
      title: 'Application',
      dataIndex: 'application',
      key: 'application',
      render: (appId) => {
        const app = applications.find((a) => a.id === appId);
        return app ? app.name : '-';
      },
    },
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol',
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Connected',
      dataIndex: 'is_connected',
      key: 'is_connected',
      render: (connected) => (
        <Tag color={connected ? 'blue' : 'default'}>
          {connected ? 'Online' : 'Offline'}
        </Tag>
      ),
    },
    {
      title: 'Last Payload Update',
      dataIndex: 'last_payload_update',
      key: 'last_payload_update',
      render: (date) =>
        date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDevice(record)}
          />
        </Space>
      ),
    },
  ];

  // ======== JSX ========

  return (
    <div>
      <Title
        level={3}
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <HddOutlined /> Device Management
      </Title>

      <Card
        bordered={false}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <Space
          direction="vertical"
          style={{ width: '100%', marginBottom: 16 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search by name or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 320, width: '100%' }}
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Add Device
            </Button>
          </div>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredDevices}
          rowKey="id"
          scroll={{ x: true }}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (t) => `Total ${t} devices`,
          }}
        />
      </Card>

      {/* Create / Edit Device Modal */}
      <Modal
        title={editingDevice ? 'Edit Device' : 'Create Device'}
        open={isDeviceModalOpen}
        onCancel={() => {
          setIsDeviceModalOpen(false);
          deviceForm.resetFields();
          setSelectedAppId(null);
          setEditingDevice(null);
        }}
        footer={null}
        width={650}
      >
        <Form
          form={deviceForm}
          layout="vertical"
          onFinish={handleDeviceSubmit}
          style={{ marginTop: 16 }}
        >
          {/* Application Selection */}
          <Form.Item label="Application" required>
            <select
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 6,
                border: '1px solid #d9d9d9',
              }}
              value={selectedAppId || ''}
              onChange={(e) => setSelectedAppId(Number(e.target.value))}
            >
              <option value="">-- Select Application --</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </Form.Item>

          <Form.Item
            name="device_uid"
            label="Device UID"
            rules={[{ required: true, message: 'Please enter device UID' }]}
          >
            <Input placeholder="ESP32_001" />
          </Form.Item>

          <Form.Item
            name="device_name"
            label="Device Name"
            rules={[{ required: true, message: 'Please enter device name' }]}
          >
            <Input placeholder="Main Controller" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Device description" />
          </Form.Item>

          <Form.Item
            name="protocol"
            label="Protocol"
            initialValue="websocket"
          >
            <Input placeholder="websocket" />
          </Form.Item>

          <Form.Item name="firmware_version" label="Firmware Version">
            <Input placeholder="v1.0.2" />
          </Form.Item>

          <Form.Item
            name="development_enabled"
            label="Development Mode"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
<Form.Item label="Payload (JSON)" name="payload_display">
  <div>
    <Button onClick={() => setShowJsonBuilder(true)}>
      Open Payload Builder
    </Button>
    
    {Object.keys(payloadObj).length > 0 && (
      <Input.TextArea
        rows={6}
        value={JSON.stringify(payloadObj, null, 2)}
        readOnly
        placeholder="Generated payload will appear here"
        style={{ marginTop: 10, background: '#f5f5f5' }}
      />
    )}
  </div>
</Form.Item>

{/* JSON Builder Modal */}
<Modal
  title="Payload Builder"
  open={showJsonBuilder}
  onCancel={() => setShowJsonBuilder(false)}
  onOk={() => {
    deviceForm.setFieldsValue({ payload: JSON.stringify(payloadObj, null, 2) });
    setShowJsonBuilder(false);
  }}
>
  <JsonBuilderComponent
    jsonData={payloadObj}
    onChange={(updatedJson) => setPayloadObj(updatedJson)}
  />
</Modal>


          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setIsDeviceModalOpen(false);
                  deviceForm.resetFields();
                  setSelectedAppId(null);
                  setEditingDevice(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={deviceSubmitting}
              >
                {editingDevice ? 'Update Device' : 'Create Device'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DevicesPage;
