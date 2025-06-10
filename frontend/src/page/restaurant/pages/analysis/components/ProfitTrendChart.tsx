import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { useLocation } from 'react-router-dom';
import styles from '../../../../../styles/financesdashboards.module.css';

interface Props {
  labels: string[];
  values: number[];
  trendView: 'daily' | 'monthly';
}

// ApexCharts types for tooltip formatter
interface ApexTooltipOpts {
  series: number[][];
  seriesIndex: number;
  dataPointIndex: number;
  w: {
    globals: {
      labels: string[];
    };
  };
}

const ProfitTrendChart: React.FC<Props> = ({ labels, values, trendView }) => {
  const location = useLocation();
  const chartOptions = {
    chart: {
      id: 'profit-trend',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      zoom: { enabled: true, type: 'x' as const, autoScaleYaxis: true },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 }
      },
    },
    xaxis: {
      categories: labels,
      crosshairs: { show: true, width: 1, position: 'back', opacity: 0.7 },
      labels: {
        style: { colors: '#666', fontSize: '10px' },
        rotate: trendView === 'monthly' ? 0 : -45,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: {
        text: trendView === 'monthly' ? 'Month' : 'Day',
        style: { color: '#666', fontSize: '12px' }
      }
    },
    yaxis: {
      labels: { style: { colors: '#666', fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: {
        text: 'Profit',
        style: { color: '#666', fontSize: '12px' }
      }
    },
    grid: { borderColor: '#f0f0f0' },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' as const, width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: ['#10b981'],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    markers: {
      size: 4,
      colors: ['#10b981'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: { size: 6 }
    },
    colors: ['#10b981'],
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => {
          // Show value as currency
          return `$${val.toLocaleString()}`;
        },
        title: {
          formatter: (seriesName: string, opts?: ApexTooltipOpts) => {
            if (opts && opts.w && opts.w.globals && opts.w.globals.labels) {
              const label = opts.w.globals.labels[opts.dataPointIndex];
              if (trendView === 'monthly') {
                return `Month: ${label}`;
              } else {
                return `Date: ${label}`;
              }
            }
            return seriesName;
          }
        }
      }
    },
    legend: { show: true, position: 'top' as const, horizontalAlign: 'right' as const }
  };
  const chartSeries = [
    {
      name: 'Profit',
      data: values,
    },
  ];
  return (
    <div className={styles.chartContainer}>
      <ReactApexChart
        key={location.pathname + '-' + trendView + '-' + labels.join(',') + '-' + values.join(',')}
        type="area"
        height={260}
        options={chartOptions}
        series={chartSeries}
      />
    </div>
  );
};

export default ProfitTrendChart;
