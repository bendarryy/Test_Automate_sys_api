import React, { useState } from "react";
import { useApi } from "../hooks/useApi";
import { MdNotifications, MdNotificationsActive, MdAccountCircle } from "react-icons/md"; // react-icons Material Design
import { useNavigate } from "react-router-dom";



const Navbar = () => {
  const [numOfNotification] = useState(2);
  const { callApi } = useApi();
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setShowAccountDropdown(false);
    try {
      await callApi('get', '/core/logout/');
      navigate('/ownerlogin');
    } catch (err) {
      // معالجة الخطأ إذا لزم الأمر
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <div className="d-flex align-items-center ms-auto">
          <div className="position-relative me-3">
            <button
              className="btn btn-link position-relative p-0"
              onClick={() => setShowNotificationDropdown((v) => !v)}
              style={{ boxShadow: 'none' }}
            >
              {numOfNotification > 0 ? (
                <>
                  <MdNotificationsActive size={24} />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {numOfNotification}
                  </span>
                </>
              ) : (
                <MdNotifications size={24} />
              )}
            </button>
            {showNotificationDropdown && (
              <div className="dropdown-menu show mt-2" style={{ minWidth: 220, right: 0, left: 'auto' }}>
                <h6 className="dropdown-header">الإشعارات</h6>
                <div className="dropdown-divider"></div>
                {numOfNotification > 0 ? (
                  [1, 2].map((n) => (
                    <button
                      key={n}
                      className="dropdown-item"
                      onClick={() => setShowNotificationDropdown(false)}
                    >
                      إشعار {n}
                    </button>
                  ))
                ) : (
                  <span className="dropdown-item text-muted">لا توجد إشعارات جديدة</span>
                )}
              </div>
            )}
          </div>
          <div className="position-relative">
            <button
              className="btn btn-link p-0"
              onClick={() => setShowAccountDropdown((v) => !v)}
              style={{ boxShadow: 'none' }}
            >
              <MdAccountCircle size={32} />
            </button>
            {showAccountDropdown && (
              <div className="dropdown-menu show mt-2" style={{ minWidth: 150, right: 0, left: 'auto' }}>
                <button className="dropdown-item" onClick={() => { setShowAccountDropdown(false); navigate('/systems'); }}>
                  My System
                </button>
                <button className="dropdown-item" onClick={() => setShowAccountDropdown(false)}>
                  الملف الشخصي
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
