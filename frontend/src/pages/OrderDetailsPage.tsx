import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import {
  Container,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Box,
} from "@mui/material";

interface OrderDetails {
  id: number;
  customer_name: string;
  table_number: string;
  total_price: string;
  status: string;
  order_items: { menu_item_name: string; quantity: number }[];
  created_at: string;
}

const statusColors: Record<string, "default" | "warning" | "success" | "error"> = {
  pending: "warning",
  preparing: "default",
  ready: "success",
  completed: "success",
  canceled: "error",
};

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { callApi, loading, error } = useApi();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const response = await callApi("get", `restaurant/5/orders/${orderId}/`);
      if (response) {
        setOrderDetails(response);
      }
    };
    fetchOrderDetails();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Container maxWidth="sm">
        <Typography color="error">{error}</Typography>
      </Container>
    );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {orderDetails ? (
        <Card sx={{ p: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Order #{orderDetails.id}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography>
                  <strong>Customer:</strong> {orderDetails.customer_name}
                </Typography>
                <Typography>
                  <strong>Table:</strong> {orderDetails.table_number}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>
                  <strong>Total Price:</strong> ${orderDetails.total_price}
                </Typography>
                <Typography>
                  <strong>Created At:</strong>{" "}
                  {new Date(orderDetails.created_at).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">Status:</Typography>
              <Chip
                label={orderDetails.status.toUpperCase()}
                color={statusColors[orderDetails.status] || "default"}
                sx={{ fontWeight: "bold" }}
              />
            </Box>

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              Order Items:
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Item</strong></TableCell>
                    <TableCell align="center"><strong>Quantity</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderDetails.order_items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.menu_item_name}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Typography>No order details found.</Typography>
      )}
    </Container>
  );
};

export default OrderDetailsPage;
