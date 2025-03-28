import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { removeItem, clearBill } from "../store/billSlice";
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

const BillSection = () => {
  const billItems = useSelector((state: RootState) => state.bill.items);
  const selectedTable = useSelector((state: RootState) => state.bill.selectedTable);
  const dispatch = useDispatch();

  const [discount, setDiscount] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);

  const total = billItems.reduce((total, item) => total + item.price, 0);
  const discountedTotal = total - (total * discount) / 100;

  const handleSendBill = async () => {
    setIsSending(true);
    try {
      const billData = {
        table: selectedTable || "External Order",
        items: billItems,
        total: total.toFixed(2),
        discountedTotal: discountedTotal.toFixed(2),
        discount: discount,
      };

      const response = await fetch("http://localhost:5173/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        throw new Error("Failed to send the bill.");
      }

      alert("Bill sent successfully!");
      dispatch(clearBill());
    } catch {
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
            disabled={isSending}
            className={`${styles.button} ${styles.sendButton}`}
          >
            {isSending ? "Sending..." : "Send Bill"}
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