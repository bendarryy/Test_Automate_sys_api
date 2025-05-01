import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setSelectedTable } from "../store/billSlice";
import GridScrollX from "./GridScrollX";
import styles from "../styles/TablesSection.module.css";
import { MdPeopleOutline } from "react-icons/md";

const tables = [
  {
    id: 1,
    status: "available",
    capacity: 4,
    isReserved: false,
  },
  {
    id: 2,
    status: "occupied",
    capacity: 4,
    isReserved: false,
  },
  {
    id: 3,
    status: "booked",
    capacity: 4,
    isReserved: false,
  },
  {
    id:4,
    status: "available",
    capacity: 4,
    isReserved: false,
  },
  {
    id: 5,
    status: "available",
    capacity: 4,
    isReserved: false,
  },
  {
    id: 6,
    status: "available",
    capacity: 4,
    isReserved: false,
  },
  {
    id: 7,
    status: "booked",
    capacity: 4,
    isReserved: false,
  },
  {
    id: 8,
    status: "occupied",
    capacity: 4,
    isReserved: false,
  },
  {
    id: 9,
    status: "available",
    capacity: 4,
    isReserved: false,
  },
  {
    id: 10,
    status: "available",
    capacity: 4,
    isReserved: false,
  },
  {
    id: 11,
    status: "available",
    capacity: 4,
    isReserved: false,
  },
];

const TablesSection: React.FC = () => {
  const dispatch = useDispatch();
  const selectedTable = useSelector((state: RootState) => state.bill.selectedTable);

  const handleChange = (id:  number) => {
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
                {table.capacity} <MdPeopleOutline size={24} />
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
