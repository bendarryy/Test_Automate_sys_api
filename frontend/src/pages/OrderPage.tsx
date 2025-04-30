import React, { useState } from "react";
import { useOrders } from "../hooks/useOrders";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Typography,
  CircularProgress,
  TableSortLabel,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SortIcon from "@mui/icons-material/Sort";
import { useNavigate } from "react-router-dom";
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';

const OrdersPage: React.FC = () => {
  const [selectedSystemId] = useSelectedSystemId();
  const { orders, loading, error, handleFilter, sortOrders, updateOrderStatus, deleteOrder } =
    useOrders(Number(selectedSystemId));
  const navigate = useNavigate();

  const [sortKey, setSortKey] = useState<"created_at" | "total_price">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Order Management
      </Typography>

      {/* Filter Orders */}
      <FormControl sx={{ minWidth: 200, mr: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select onChange={(e) => handleFilter(e.target.value)} defaultValue="">
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="preparing">Preparing</MenuItem>
          <MenuItem value="ready">Ready</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="canceled">Canceled</MenuItem>
        </Select>
      </FormControl>

      {/* Sort Orders */}
      <Button
        startIcon={<SortIcon />}
        onClick={() => {
          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          sortOrders(sortKey, sortOrder);
        }}
      >
        Sort by {sortKey} ({sortOrder})
      </Button>

      {/* Loading and Error States */}
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortKey === "total_price"}
                  direction={sortOrder}
                  onClick={() => {
                    setSortKey("total_price");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    sortOrders("total_price", sortOrder);
                  }}
                >
                  Total Price
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.table_number}</TableCell>
                  <TableCell>${order.total_price}</TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <Select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="preparing">Preparing</MenuItem>
                        <MenuItem value="ready">Ready</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="canceled">Canceled</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/orders/${order.id}`)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate(`/orders/${order.id}/edit`)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <IconButton onClick={() => deleteOrder(order.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default OrdersPage;
