<template>
  <div class="app-background py-5">
    <div class="container text-center">
      <h1 class="display-4 fw-bold mb-5 text-dark">Degvielas Cenas</h1>

      <div class="row g-5 justify-content-center">
        
        <div class="col-md-4">
          <div class="card fuel-card shadow-lg border-0 p-4">
            <img src="@/assets/Viada_logo.jpg" class="img-fluid mb-3" alt="Viada Logo" />
            <p class="fs-5 mb-1">D: €{{ viadaStation?.d_cena || "N/A" }}</p>
            <p class="fs-5 mb-1">D Ecto: €{{ viadaStation?.supd_cena || "N/A" }}</p>
            <p class="fs-5 mb-1">95: €{{ viadaStation?.['95_cena'] || "N/A" }}</p>
            <p class="fs-5 mb-1">98: €{{ viadaStation?.['98_cena'] || "N/A" }}</p>
          </div>
        </div>

        
        <div class="col-md-4">
          <div class="card fuel-card shadow-lg border-0 p-4">
            <img src="@/assets/Circle_K_logo_2015.svg.png" class="img-fluid mb-3" alt="Circle K" />
            <p class="fs-5 mb-1">Dmiles: €{{ circleStation?.d_cena || "N/A" }}</p>
            <p class="fs-5 mb-1">Dmiles+: €{{ circleStation?.supd_cena || "N/A" }}</p>
            <p class="fs-5 mb-1">95Miles: €{{ circleStation?.['95_cena'] || "N/A" }}</p>
            <p class="fs-5 mb-1">98Miles+: €{{ circleStation?.['98_cena'] || "N/A" }}</p>
          </div>
        </div>

        
        <div class="col-md-4">
          <div class="card fuel-card shadow-lg border-0 p-4">
            <img src="@/assets/Neste_logo.png" class="img-fluid mb-3" alt="Neste" />
            <p class="fs-5 mb-1">Futura D: €{{ nesteStation?.d_cena || "N/A" }}</p>
            <p class="fs-5 mb-1">Pro Diesel: €{{ nesteStation?.supd_cena || "N/A" }}</p>
            <p class="fs-5 mb-1">Futura 95: €{{ nesteStation?.['95_cena'] || "N/A" }}</p>
            <p class="fs-5 mb-1">Futura 98: €{{ nesteStation?.['98_cena'] || "N/A" }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fuel-card {
  background: white;
  border-radius: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.fuel-card:hover {
  transform: scale(1.05);
  box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.2);
}
</style>



<script>
import '@/css/MainView.css'
import axios from "axios";

export default {
  data() {
    return {
      stations: [],
      viadaStation: null,
      circleStation: null,
      nesteStation: null,
    };
  },
  methods: {
    async fetchStations() {
      try {
        const response = await axios.get("http://localhost:5000/uzpildes_stacijas");
        this.stations = response.data;

        console.log("Fetched stations:", this.stations);

        this.viadaStation = this.stations.find(s => s.tanka_vards.toLowerCase() === "viada") || {};
        this.circleStation = this.stations.find(s => s.tanka_vards.toLowerCase() === "circle k") || {};
        this.nesteStation = this.stations.find(s => s.tanka_vards.toLowerCase() === "neste") || {};
      } catch (error) {
        console.error("Kļūda iegūstot degvielas cenas:", error);
      }
    },
  },
  mounted() {
    this.fetchStations();
  },
};
</script>
