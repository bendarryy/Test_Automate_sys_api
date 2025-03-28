import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setSelectedTable } from "../store/billSlice";
import GridScrollX from "./GridScrollX";
import styles from "../styles/TablesSection.module.css";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";

const tables = [
  {
    id: "1-unique",
    status: "available",
    capacity: 4,
    isReserved: false,
  },
  {
    id: "2-unique",
    status: "occupied",
    capacity: 4,
    isReserved: false,
  },
  {
    id: "3-unique",
    status: "booked",
    capacity: 4,
    isReserved: false,
  },
  {
    id: "4-unique",
    status: "available",
    capacity: 4,
    isReserved: false,
  },
  {
    id: "5-unique",
    status: "available",
    capacity: 4,
    isReserved: false,
  },
  {
    id: "6-unique",
    status: "available",
    capacity: 4,
    isReserved: false,
  },
  {
    id: "7-unique",
    status: "booked",
    capacity: 4,
    isReserved: false,
  },
  {
    id: "8-unique",
    status: "occupied",
    capacity: 4,
    isReserved: false,
  },
  {
    id: "9-unique",
    status: "available",
    capacity: 4,
    isReserved: false,
  },
  {
    id: "10-unique",
    status: "available",
    capacity: 4,
    isReserved: false,
  },
  {
    id: "11-unique",
    status: "available",
    capacity: 4,
    isReserved: false,
  },
];

const TablesSection: React.FC = () => {
  const dispatch = useDispatch();
  const selectedTable = useSelector((state: RootState) => state.bill.selectedTable);

  const handleChange = (id: string) => {
    dispatch(setSelectedTable(id === selectedTable ? null : id)); // تحديث الطاولة المحددة
  };


  return (
    <GridScrollX
      
      items={tables}
      renderItem={(table, index) => (
        <>
          <input
            type="checkbox"
            name="table"
            id={`table-${table.id}`}
            className={styles.checkbox}
            checked={selectedTable === table.id}
            onChange={() => handleChange(table.id)}
          />
          <label htmlFor={`table-${table.id}`}>
            <div className={`${styles.table} ${styles[table.status]}`}>
              <h3>table {index + 1}</h3>
              <p>
                {table.capacity} <PeopleOutlineIcon fontSize="small" />
              </p>
              <div className={`${styles[table.status]} ${styles.status}`}>
                {table.status}
              </div>
            </div>
          </label>
        </>
      )}
    />
  );
};

export default TablesSection;
