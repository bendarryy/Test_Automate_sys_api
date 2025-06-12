import React from 'react';
import styles from '../styles/TablesSection.module.css';
import { Table } from '../../types';

interface GridScrollXProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}

const GridScrollX = React.memo(({ items, renderItem }: GridScrollXProps<Table>) => {
  return (
    <div className={styles.tablesContainer} style={{ flex: 1 }}>
      <div className={styles.tables}>
        {items.map((item, index) => (
          <div key={index} className={styles.tableItem}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

export default GridScrollX;
