import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Select, Table, Tag, Tooltip, notification, Spin, Checkbox, Row, Col, Typography, Space, Tabs } from 'antd';
import { UserOutlined, SafetyOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, EyeInvisibleOutlined, CheckOutlined, UserAddOutlined } from '@ant-design/icons';
import { getUsers, createUser, updateUser, deleteUser, restoreUser, getRoles, createRole, updateRole, getPermissions } from './services/configService';

const { Option } = Select;
const { Title } = Typography;

const ConfigPage = ({ theme }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Users state
  const [users, setUsers] = useState([]);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userForm] = Form.useForm();
  
  // Roles state
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm] = Form.useForm();

  const roleColors = { 
    Administrator: 'purple', 
    Manager: 'blue', 
    Operator: 'green', 
    Viewer: 'gold', 
    SuperAdmin: 'red', 
    HR: 'cyan' 
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, rolesData, permsData] = await Promise.all([
        getUsers(showDeletedUsers),
        getRoles(),
        getPermissions()
      ]);
      setUsers(Array.isArray(usersData) ? usersData.map(u => ({ ...u, key: u.id })) : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permsData) ? permsData : []);
    } catch (error) {
      notification.error({ 
        message: 'Fetch Failed', 
        description: error.message || 'Could not load data.' 
      });
    } finally {
      setLoading(false);
    }
  }, [showDeletedUsers]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // User Management
  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      userForm.setFieldsValue({ 
        ...user, 
        roles: user.role_details.map(r => r.id) 
      });
    } else {
      setEditingUser(null);
      userForm.resetFields();
    }
    setUserModalOpen(true);
  };

  const handleUserSubmit = async (values) => {
    setLoading(true);
    try {
      const body = { 
        ...values, 
        roles: values.roles ? [values.roles] : [] 
      };
      if (editingUser) {
        await updateUser(editingUser.id, body);
        notification.success({ message: 'User Updated' });
      } else {
        await createUser(body);
        notification.success({ message: 'User Created' });
      }
      setUserModalOpen(false);
      fetchData();
    } catch (error) {
      const errorMsg = error.email 
        ? `Email: ${error.email[0]}` 
        : (error.message || 'Failed to save user.');
      notification.error({ 
        message: 'Save Failed', 
        description: errorMsg 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserDelete = (id) => {
    Modal.confirm({ 
      title: 'Are you sure?', 
      content: 'This will temporarily deactivate the user.', 
      async onOk() {
        try { 
          await deleteUser(id); 
          notification.success({ message: 'User Deactivated'}); 
          fetchData(); 
        } catch(e) { 
          notification.error({ message: 'Failed'})
        }
      }
    });
  };

  const handleUserRestore = (id) => {
    Modal.confirm({ 
      title: 'Are you sure?', 
      content: 'This will reactivate the user.', 
      async onOk() {
        try { 
          await restoreUser(id); 
          notification.success({ message: 'User Reactivated'}); 
          fetchData(); 
        } catch(e) { 
          notification.error({ message: 'Failed'})
        }
      }
    });
  };

  const userColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Role', 
      key: 'role', 
      render: (_, r) => r.role_details.map(role => (
        <Tag key={role.id} color={roleColors[role.name] || 'default'}>
          {role.name}
        </Tag>
      ))
    },
    { 
      title: 'Status', 
      key: 'status', 
      render: (_, r) => (
        <Tag color={r.deleted_at ? 'error' : 'success'}>
          {r.deleted_at ? 'Inactive' : 'Active'}
        </Tag>
      )
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_, r) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => openUserModal(r)}
            />
          </Tooltip>
          {r.deleted_at 
            ? <Tooltip title="Restore">
                <Button 
                  icon={<CheckOutlined />} 
                  size="small"
                  onClick={() => handleUserRestore(r.id)}
                />
              </Tooltip>
            : <Tooltip title="Deactivate">
                <Button 
                  icon={<DeleteOutlined />} 
                  size="small"
                  danger 
                  onClick={() => handleUserDelete(r.id)}
                />
              </Tooltip>
          }
        </Space>
      )
    }
  ];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Role Management
  const openRoleModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      roleForm.setFieldsValue({ 
        ...role, 
        permissions: role.permission_details.map(p => p.id) 
      });
    } else {
      setEditingRole(null);
      roleForm.resetFields();
    }
    setRoleModalOpen(true);
  };

  const handleRoleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, values);
        notification.success({ message: 'Role Updated' });
      } else {
        await createRole(values);
        notification.success({ message: 'Role Created' });
      }
      setRoleModalOpen(false);
      fetchData();
    } catch (error) {
      notification.error({ 
        message: 'Save Failed', 
        description: error.message || 'Failed to save role.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const roleColumns = [
    { title: 'Role Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { 
      title: 'Permissions', 
      key: 'permissions', 
      render: (_, r) => `${r.permission_details.length} permissions`
    },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_, r) => (
        <Tooltip title="Edit">
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => openRoleModal(r)}
          />
        </Tooltip>
      )
    }
  ];

  const tabItems = [
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          {' User Management'}
        </span>
      ),
      children: (
        <div>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Input 
              prefix={<SearchOutlined />} 
              placeholder="Search users..." 
              style={{ width: 300 }}
              value={userSearch} 
              onChange={e => setUserSearch(e.target.value)} 
            />
            <Space>
              <Button 
                icon={showDeletedUsers ? <EyeInvisibleOutlined /> : <EyeOutlined />} 
                onClick={() => setShowDeletedUsers(!showDeletedUsers)}
              >
                {showDeletedUsers ? 'Hide Inactive' : 'Show Inactive'}
              </Button>
              <Button 
                type="primary" 
                icon={<UserAddOutlined />} 
                onClick={() => openUserModal()}
              >
                Add User
              </Button>
            </Space>
          </Space>
          <Table 
            columns={userColumns} 
            dataSource={filteredUsers} 
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
          />
        </div>
      ),
    },
    {
      key: 'roles',
      label: (
        <span>
          <SafetyOutlined />
          {' Roles & Permissions'}
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => openRoleModal()}
            >
              Create Role
            </Button>
          </div>
          <Table 
            columns={roleColumns} 
            dataSource={roles} 
            loading={loading} 
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Settings & Configuration
      </Title>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        items={tabItems}
      />

      {/* User Modal */}
      <Modal 
        title={editingUser ? 'Edit User' : 'Add User'} 
        open={isUserModalOpen} 
        onCancel={() => setUserModalOpen(false)} 
        footer={null}
      >
        <Spin spinning={loading}>
          <Form 
            form={userForm} 
            layout="vertical" 
            onFinish={handleUserSubmit} 
            style={{ marginTop: 24 }}
          >
            <Form.Item 
              name="name" 
              label="Full Name" 
              rules={[{ required: true, message: 'Please enter full name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
              name="email" 
              label="Email" 
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter valid email' }
              ]}
            >
              <Input disabled={!!editingUser}/>
            </Form.Item>
            <Form.Item name="mobile" label="Phone Number">
              <Input />
            </Form.Item>
            <Form.Item 
              name="roles" 
              label="Role" 
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select placeholder="Select a role">
                {roles.map(r => (
                  <Option key={r.id} value={r.id}>{r.name}</Option>
                ))}
              </Select>
            </Form.Item>
            {!editingUser && (
              <Form.Item 
                name="password" 
                label="Password" 
                rules={[{ required: true, message: 'Please enter password' }]}
              >
                <Input.Password />
              </Form.Item>
            )}
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setUserModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">Save</Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Modal>

      {/* Role Modal */}
      <Modal 
        title={editingRole ? 'Edit Role' : 'Create Role'} 
        open={isRoleModalOpen} 
        onCancel={() => setRoleModalOpen(false)} 
        footer={null} 
        width={600}
      >
        <Spin spinning={loading}>
          <Form 
            form={roleForm} 
            layout="vertical" 
            onFinish={handleRoleSubmit} 
            style={{ marginTop: 24 }}
          >
            <Form.Item 
              name="name" 
              label="Role Name" 
              rules={[{ required: true, message: 'Please enter role name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="permissions" label="Permissions">
              <Checkbox.Group style={{ width: '100%' }}>
                <Row>
                  {permissions.map(p => (
                    <Col span={12} key={p.id} style={{ marginBottom: 8 }}>
                      <Checkbox value={p.id}>{p.name}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setRoleModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">Save</Button>
              </Space>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default ConfigPage;