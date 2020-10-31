import { GROUPING_UNITS } from '../../../../../../common/constants';

export const chartOptions = (symbol, data, groupUnit) => ({
  chart: {
    height: '380px'
  },
  rangeSelector: {
    selected: 4,
    inputEnabled: false,
    buttonTheme: {
      visibility: 'hidden'
    },
    labelStyle: {
      visibility: 'hidden'
    }
  },
  series: [
    {
      type: 'candlestick',
      name: symbol,
      data: data.map(
        ({ date, open, high, low, close }) => [
          (new Date(date)).getTime(), open, high, low, close
        ]
      ),
      dataGrouping: {
        units: [['minute', [groupUnit]]]
      },
      groupingUnits: [
        ['minute', GROUPING_UNITS]
      ]
    }
  ],
  plotOptions: {
    candlestick: {
      color: 'red',
      upColor: 'green'
    }
  },
});