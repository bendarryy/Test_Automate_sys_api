import React from 'react';
import styles from '../styles/TablesSection.module.css';

interface GridScrollXProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}

const GridScrollX = <T,>({ items, renderItem }: GridScrollXProps<T>) => {
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
};

export default GridScrollX;
