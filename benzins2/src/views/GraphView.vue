<template>
  <div class="graph-container">
    <h1 class="text-2xl font-bold mb-4">Degvielas cenu vēsture</h1>

    <label for="fuelType" class="block mb-2 font-semibold">Izvēlies degvielas tipu:</label>
    <select v-model="selectedFuelType" @change="renderChart" id="fuelType" class="mb-4 p-2 border rounded">
      <option value="95_cena">95</option>
      <option value="98_cena">98</option>
      <option value="d_cena">Dīzelis</option>
      <option value="supd_cena">Super Dīzelis</option>
    </select>

    <div class="chart-box">
      <canvas ref="fuelChart" width="800" height="400"></canvas>
    </div>
  </div>
</template>

<script>
import '@/css/GraphView.css'
import axios from "axios";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default {
  data() {
    return {
      chart: null,
      selectedFuelType: '95_cena', // default = 95
    };
  },
  methods: {
    async fetchHistoryData() {
      try {
        const response = await axios.get("http://localhost:5000/fuel-history");
        const data = response.data;

        const stations = ['Viada', 'Circle K', 'Neste'];
        const fuelType = this.selectedFuelType;

        const grouped = stations.map(station => {
          const filtered = data.filter(entry => entry.tanka_vards === station);

          return {
            label: station,
            data: filtered.map(entry => {
              const price = entry[fuelType];
              if (typeof price === 'string') {
                return parseFloat(price.replace(',', '.'));
              } else if (typeof price === 'number') {
                return price;
              } else {
                return null;
              }
            }),
            timestamps: filtered.map(entry => entry.timestamps), // <-- MySQL column is `timestamps`
          };
        });

        return grouped;
      } catch (err) {
        console.error("Error fetching history data:", err);
        return [];
      }
    },
    async renderChart() {
      const grouped = await this.fetchHistoryData();

      if (this.chart) {
        this.chart.destroy();
      }

      const allTimestamps = grouped[0]?.timestamps || [];

      const datasets = grouped.map(station => ({
        label: station.label,
        data: station.data,
        borderColor: this.getColor(station.label),
        fill: false,
        tension: 0.3,
      }));

      const ctx = this.$refs.fuelChart.getContext("2d");

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: allTimestamps,
          datasets,
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: this.getChartTitle(),
            },
            legend: {
              position: 'bottom',
            },
          },
          scales: {
            y: {
              title: {
                display: true,
                text: "Cena (€)"
              }
            },
            x: {
              ticks: {
                maxTicksLimit: 10,
                autoSkip: true
              }
            }
          }
        }
      });
    },
    getChartTitle() {
      const map = {
        "95_cena": "95 degvielas cenu vēsture",
        "98_cena": "98 degvielas cenu vēsture",
        "d_cena": "Dīzeļa cenu vēsture",
        "supd_cena": "Super Dīzeļa cenu vēsture"
      };
      return map[this.selectedFuelType] || "Degvielas cenu vēsture";
    },
    getColor(station) {
      const colors = {
        "Viada": "#FF6384",
        "Circle K": "#36A2EB",
        "Neste": "#4BC0C0"
      };
      return colors[station] || "#000000";
    }
  },
  mounted() {
    this.renderChart();
  }
};
</script>
