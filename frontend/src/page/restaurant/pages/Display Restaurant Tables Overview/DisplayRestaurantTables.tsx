import React, { useEffect, useState } from 'react';
import { Card, Grid, Typography, Box, CircularProgress } from '@mui/material';
import apiClient from '../../../../config/apiClient.config';
import { useSelectedSystemId } from '../../../../shared/hooks/useSelectedSystemId';
import './DisplayRestaurantTables.css';

interface RestaurantData {
  id: number;
  system: number;
  number_of_tables: number;
}

interface TableData {
  table_number: string;
  is_occupied: boolean;
  current_order?: {
    order_id: number;
    status: string;
    customer_name: string | null;
    waiter: string | null;
    created_at: string;
  };
}

const DisplayRestaurantTables: React.FC = () => {
  const [systemId] = useSelectedSystemId();
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!systemId) {
        setError('System ID is not available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('DEBUG: systemId =', systemId);
        const restaurantResponse = await apiClient.get(`/restaurant/systems/${systemId}/restaurant-data/`);
        console.log('DEBUG: restaurantResponse.data =', restaurantResponse.data);
        setRestaurantData(restaurantResponse.data);

        const occupiedTablesResponse = await apiClient.get(`/restaurant/systems/${systemId}/tables/occupied_tables/`);
        console.log('Tables Data:', occupiedTablesResponse.data);
        setTables(Array.isArray(occupiedTablesResponse.data) ? occupiedTablesResponse.data : []);

      } catch (err: any) {
        console.error('Error fetching data:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
          console.error('Error status:', err.response.status);
          setError(`Error: ${err.response.data.message || 'Failed to fetch data'}`);
        } else if (err.request) {
          console.error('Error request:', err.request);
          setError('No response from server. Please check your connection.');
        } else {
          console.error('Error message:', err.message);
          setError('An error occurred while setting up the request.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [systemId]);

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Typography variant="h6">
          {error}
        </Typography>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div className="error-container">
        <Typography variant="h6">
          No restaurant data available
        </Typography>
      </div>
    );
  }

  const allTables = Array.from({ length: restaurantData.number_of_tables }, (_, index) => {
    const tableNumber = (index + 1).toString();
    const tableData = Array.isArray(tables) ? tables.find(t => t.table_number === tableNumber) : null;
    return {
      tableNumber,
      isOccupied: tableData?.is_occupied || false,
      currentOrder: tableData?.current_order
    };
  });

  return (
    <div className="tables-container">
      <Typography variant="h4" gutterBottom>
        Restaurant Tables Overview
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Total Tables: {restaurantData.number_of_tables}
      </Typography>

      <Grid container spacing={3} className="tables-grid" columns={12}>
        {allTables.map(({ tableNumber, isOccupied, currentOrder }) => (
          <Grid key={tableNumber} style={{ gridColumn: 'span 3' }}>
            <Card className={`table-card ${isOccupied ? 'occupied' : 'free'}`}>
              <Typography variant="h6" className="table-number">
                Table {tableNumber}
              </Typography>
              <Typography className={`table-status ${isOccupied ? 'occupied' : 'free'}`}>
                {isOccupied ? 'Occupied' : 'Free'}
              </Typography>
              {isOccupied && currentOrder && (
                <div className="order-info">
                  <Typography variant="body2">
                    Order ID: {currentOrder.order_id}
                  </Typography>
                  <Typography variant="body2">
                    Status: {currentOrder.status}
                  </Typography>
                </div>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default DisplayRestaurantTables; 