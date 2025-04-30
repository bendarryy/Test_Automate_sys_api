import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { removeItem, clearBill, addItem } from "../store/billSlice";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
} from "@mui/material";
import styles from "../styles/BillSection.module.css";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useSendOrders } from "../hooks/useSendOrders";
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';
const BillSection = () => {
  const billItems = useSelector((state: RootState) => state.bill.items);
  const selectedTable = useSelector((state: RootState) => state.bill.selectedTable);
  const dispatch = useDispatch();

  const [discount, setDiscount] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);

const [selectedSystemId] = useSelectedSystemId();
const { createOrder, addItemToOrder, loading: apiLoading } = useSendOrders(Number(selectedSystemId));

  const total = billItems.reduce((total, item) => total + item.price, 0);
  const discountedTotal = total - (total * discount) / 100;

  const handleSendBill = async () => {
    setIsSending(true);
    try {
      const orderData = {
        customer_name: "John Doe",
        table_number: "5", // Change to string to match the expected type
        waiter: null, // Provide a default waiter ID
      };

      // Create a new order
      const orderResponse = await createOrder(orderData);

      // Add items to the created order
      const orderId = orderResponse.id;
      for (const item of billItems) {
        const payload = {
          menu_item: Number(item.id), // Ensure item.id is converted to a number
          quantity: item.quantity,
        };
        await addItemToOrder(orderId, payload); // Send each item individually
      }

      alert("Bill sent successfully!");
      dispatch(clearBill());
    } catch (err) {
      console.error(err);
      alert("Failed to send the bill. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handlePrintBill = () => {
    window.print();
  };

  return (
    <Box className={styles.container} justifyContent={"space-between"} display={"flex"} flexDirection={"column"}>
      <Typography className={styles.title}>
        {selectedTable
          ? `Bill for Table: ${selectedTable}`
          : "Bill for External Order"}
      </Typography>
      <Box className={styles.body}>
      {billItems.length === 0 ? (
        <Box className={styles.emptyBill}>
        <IoMdAddCircleOutline size={100} />
        <h3>
          Add items to the bill
        </h3>
        </Box>
      ) : (
        <List className={styles.list}>
          {billItems.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem className={styles.listItem}>
                <ListItemText
                  primary={item.name}
                  secondary={`Price: $${item.price.toFixed(2)}`}
                  className={styles.listItemText}
                />
                <TextField
                  type="number"
                  value={item.quantity} // عرض الكمية الحالية
                  InputProps={{ inputProps: { min: 1 } }}
                  className={styles.quantityInput}
                  size="small"
                  style={{ width: "80px", marginRight: "10px" }}
                  onChange={(e) => {
                    const newQuantity = Number(e.target.value);
                    if (newQuantity > 0) {
                      dispatch(
                        addItem({
                          ...item,
                          quantity: newQuantity - item.quantity, // تحديث الكمية بناءً على الفرق
                        })
                      );
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => dispatch(removeItem(item.id))}
                  className={styles.removeButton}
                >
                  Remove
                </Button>
              </ListItem>
              <Divider className={styles.divider} />
            </React.Fragment>
          ))}
        </List>
      )}
      </Box>
      

      <Box className={styles.footer}>
          <TextField
            label="Discount (%)"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            fullWidth
            className={styles.discountInput}
          />
          <Typography className={styles.total}>
            Total: ${total.toFixed(2)}
          </Typography>
          <Typography className={styles.discountedTotal}>
            Total after Discount: ${discountedTotal.toFixed(2)}
          </Typography>


      
        <Box className={styles.buttonContainer}>
          <Button
            variant="contained"
            onClick={() => dispatch(clearBill())}
            className={`${styles.button} ${styles.clearButton}`}
          >
            Clear Bill
          </Button>
          <Button
            variant="contained"
            onClick={handleSendBill}
            disabled={isSending || apiLoading}
            className={`${styles.button} ${styles.sendButton}`}
          >
            {isSending || apiLoading ? "Sending..." : "Send Bill"}
          </Button>
          <Button
            variant="contained"
            onClick={handlePrintBill}
            className={`${styles.button} ${styles.printButton}`}
          >
            Print Bill
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BillSection;