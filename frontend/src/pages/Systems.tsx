import React, { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';
const Systems: React.FC = () => {
  interface System {
  id: number;
  name?: string;
  description?: string;
}

const { data, loading, error, callApi } = useApi<System[]>();
  const navigate = useNavigate();
  const [, setSelectedSystemId] = useSelectedSystemId();

  useEffect(() => {
    callApi('get', '/core/systems');
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">قائمة الأنظمة</h2>
      {loading && <div className="alert alert-info">جاري التحميل...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        {data && Array.isArray(data) && data.length > 0 ? (
          data.map((system: System) => (
            <div className="col-md-4 mb-4" key={system.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{system.name || `System #${system.id}`}</h5>
                  <p className="card-text">
                    {system.description || 'لا يوجد وصف متاح.'}
                  </p>
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => { setSelectedSystemId(system.id.toString()); navigate('/'); }}
                  >
                    الانتقال إلى النظام
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading && <div className="col-12"><div className="alert alert-warning">لا توجد أنظمة متاحة.</div></div>
        )}
      </div>
    </div>
  );
};

export default Systems;