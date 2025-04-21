import React from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEditOrder } from "../hooks/useEditOrder";
import { useNavigate } from "react-router-dom";
import { useGetMenu } from "../hooks/useGetMenu";

const EditOrderPage: React.FC = () => {
  const {
    formData,
    orderItems,
    orderDetails,
    loading,
    error,
    handleInputChange,
    handleItemNameChange,
    handleQuantityChange,
    handleDeleteItem,
    handleAddItem,
    handleSubmit,
  } = useEditOrder();

  const { getMenu, data, loading: menuLoading, error: menuError } = useGetMenu(5);
  
  React.useEffect(() => {
    getMenu();
  }, []);
  const navigate = useNavigate();

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
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Edit Order #{orderDetails?.id}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Customer Name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Table Number"
            name="table_number"
            value={formData.table_number}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Total Price"
            name="total_price"
            value={formData.total_price}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            margin="normal"
          />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Order Items
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderItems.map((item,index) => (
                  
                  <TableRow key={item.id+index}>
                    <TableCell>
                      <Select
                        fullWidth
                        value={item.menu_item_name}
                        onChange={(e) =>
                          handleItemNameChange(item.id, e.target.value)
                        }
                      >
                        {data?.map((menuItem) => (
                          <MenuItem key={menuItem.id} value={menuItem.name}>
                            {menuItem.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleQuantityChange(item.id, -1)}>
                        <RemoveIcon />
                      </IconButton>
                      {item.quantity}
                      <IconButton onClick={() => handleQuantityChange(item.id, 1)}>
                        <AddIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => handleDeleteItem(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button variant="outlined" color="primary" onClick={handleAddItem} sx={{ mt: 2 }}>
            Add Item
          </Button>
          <Typography variant="h6" sx={{ mt: 3 }}>
            Add Items from Menu
          </Typography>
          {menuLoading ? (
            <CircularProgress />
          ) : menuError ? (
            <Typography color="error">{menuError}</Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {data?.map((menuItem) => (
                <Button
                  key={menuItem.id}
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                  onClick={() => {
                  handleAddItem({
                    id: menuItem.id,
                    menu_item_name: menuItem.name,
                    quantity: 1,
                  });
                  
                  }}
                >
                  {menuItem.name}
                </Button>
              ))}
            </Box>
          )}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button variant="contained" color="primary" type="submit">
              Save
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditOrderPage;
