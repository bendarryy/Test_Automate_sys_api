import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setSelectedTable } from "../store/billSlice";
import GridScrollX from "./GridScrollX";
import styles from "../styles/TablesSection.module.css";
import { MdPeopleOutline } from "react-icons/md";
import { Table } from '../types';

const tables: Table[] = [
  {
    id: 1,
    name: 'Table 1',
    status: "available",
    capacity: 4
  },
  {
    id: 2,
    name: 'Table 2',
    status: "available",
    capacity: 6
  },
  {
    id: 3,
    name: 'Table 3',
    status: "reserved",
    capacity: 2
  },
  {
    id: 4,
    name: 'Table 4',
    status: "occupied",
    capacity: 8
  },
  {
    id: 5,
    name: 'Table 5',
    status: "available",
    capacity: 4
  },
  {
    id: 6,
    name: 'Table 6',
    status: "reserved",
    capacity: 6
  },
  {
    id: 7,
    name: 'Table 7',
    status: "available",
    capacity: 2
  },
  {
    id: 8,
    name: 'Table 8',
    status: "occupied",
    capacity: 8
  },
  {
    id: 9,
    name: 'Table 9',
    status: "available",
    capacity: 4
  },
  {
    id: 10,
    name: 'Table 10',
    status: "reserved",
    capacity: 6
  },
  {
    id: 11,
    name: 'Table 11',
    status: "available",
    capacity: 2
  },
  {
    id: 12,
    name: 'Table 12',
    status: "occupied",
    capacity: 8
  }
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
      renderItem={(table: Table) => (
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
              <h3>{table.name}</h3>
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
