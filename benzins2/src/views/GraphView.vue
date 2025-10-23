<template>
  <div class="container py-5">
    <div class="card shadow border-0 p-4">
      <h3 class="text-center mb-4 fw-bold">Degvielas Cenu Vēsture</h3>
      <div class="mb-3 text-center">
        <select 
          v-model="selectedFuelType" 
          @change="fetchData" 
          class="form-select d-inline-block"
          style="width: auto; padding-right: 1.8em;"
        >
          <option disabled value="">Izvēlies degvielas tipu</option>
          <option value="d_cena">D</option>
          <option value="supd_cena">D Ecto</option>
          <option value="95_cena">95</option>
          <option value="98_cena">98</option>
        </select>
    </div>
      <canvas ref="chartCanvas" class="w-100" height="300"></canvas>
    </div>
  </div>
</template>


<script>
import axios from "axios";

export default {
  name: "GraphView",
  data() {
    return {
      selectedFuelType: "",
      fuelData: {}, // store data by station name
      stations: ["viada", "circle k", "neste"],
      colors: {
        "viada": "#ff4b5c",
        "circle k": "#4285f4",
        "neste": "#34a853",
      },
    };
  },
  methods: {
    async fetchData() {
      if (!this.selectedFuelType) return;

      try {
        const allData = {};

        for (const name of this.stations) {
          const response = await axios.get(
            `http://localhost:5000/fuel_prices_history/${encodeURIComponent(name)}`
          );
          allData[name] = response.data;
        }

        this.fuelData = allData;
        this.drawChart();
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    },

    drawChart() {
      const canvas = this.$refs.chartCanvas;
      const ctx = canvas.getContext("2d");
      const width = (canvas.width = 600);
      const height = (canvas.height = 350);
      ctx.clearRect(0, 0, width, height);

      if (!this.selectedFuelType) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#666";
        ctx.fillText("Izvēlies degvielas tipu, lai skatītu datus", 140, height / 2);
        return;
      }

      const allPrices = Object.values(this.fuelData)
        .flat()
        .map((r) => r[this.selectedFuelType])
        .filter((p) => p != null);

      if (!allPrices.length) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#666";
        ctx.fillText("Nav datu par šo degvielas tipu", 200, height / 2);
        return;
      }

      const maxPrice = Math.max(...allPrices);
      const minPrice = Math.min(...allPrices);

      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 20);
      ctx.lineTo(50, height - 30);
      ctx.lineTo(width - 20, height - 30);
      ctx.stroke();

      for (const [name, data] of Object.entries(this.fuelData)) {
        if (!data.length) continue;

        const prices = data.map((r) => r[this.selectedFuelType]);
        const stepX = (width - 100) / (prices.length - 1);
        ctx.beginPath();
        ctx.strokeStyle = this.colors[name];
        ctx.lineWidth = 2;

        prices.forEach((price, i) => {
          const x = 50 + i * stepX;
          const y =
            ((maxPrice - price) / (maxPrice - minPrice)) * (height - 60) + 20;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.fillStyle = this.colors[name];
        prices.forEach((price, i) => {
          const x = 50 + i * stepX;
          const y =
            ((maxPrice - price) / (maxPrice - minPrice)) * (height - 60) + 20;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      let legendX = 70;
      for (const [name, color] of Object.entries(this.colors)) {
        ctx.fillStyle = color;
        ctx.fillRect(legendX, height - 20, 10, 10);
        ctx.fillStyle = "#333";
        ctx.font = "12px Arial";
        ctx.fillText(name.toUpperCase(), legendX + 15, height - 10);
        legendX += 100;
      }

      ctx.fillStyle = "#333";
      ctx.font = "12px Arial";
      ctx.fillText(`Max: €${maxPrice.toFixed(2)}`, 10, 20);
      ctx.fillText(`Min: €${minPrice.toFixed(2)}`, 10, height - 35);
    },
  },
};
</script>

<style scoped>
canvas {
  width: 600px;
  height: 350px;
}
</style>
