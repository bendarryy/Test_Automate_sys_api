import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus } from 'react-icons/fi';

const InviteEmployeePage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    password: '',
  });
  const { loading, error, callApi } = useApi();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await callApi('post', '/core/5/invite/', form);
      setSuccess(true);
      setForm({ name: '', role: '', phone: '', email: '', password: '' });
      setTimeout(() => navigate('/employees'), 1500);
    } catch {
      setSuccess(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: 430, width: '100%' }}>
        <div className="text-center mb-4">
          <span className="bg-primary text-white rounded-circle p-3 mb-2 d-inline-block">
            <FiUserPlus size={32} />
          </span>
          <h2 className="fw-bold">Invite New Employee</h2>
          <p className="text-muted mb-0">Fill out the form to add a new team member to your system.</p>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          {success && (
            <div className="alert alert-success" role="alert">
              Employee invited successfully!
            </div>
          )}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="e.g. Mohamed Ali"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="waiter">Waiter</option>
              <option value="chef">Chef</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="form-control"
              placeholder="e.g. 01012345678"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="e.g. mohamed@restaurant.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Choose a strong password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <FiUserPlus className="me-2" />
            )}
            {loading ? 'Inviting...' : 'Invite Employee'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteEmployeePage;
