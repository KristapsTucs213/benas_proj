<template>
  <div class="about">
    <h1 class="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
      DEGVIELAS CENAS
    </h1>
    <div class="stati-box">
      <div class="viada_stats" v-if="viadaStation">
        <img src="@/assets/Viada_logo.jpg" alt="viada_photo" width="200" height="75">
        <h2>D: €{{ viadaStation.d_cena || "N/A" }}</h2>
        <h2>D Ecto: €{{ viadaStation.supd_cena || "N/A" }}</h2>
        <h2>95: €{{ viadaStation['95_cena'] || "N/A" }}</h2>
        <h2>98: €{{ viadaStation['98_cena'] || "N/A" }}</h2>
      </div>

      <div class="circle_stats" v-if="circleStation">
        <img src="@/assets/Circle_K_logo_2015.svg.png" alt="circle_photo" width="200" height="75">
        <h2>Dmiles: €{{ circleStation.d_cena || "N/A" }}</h2>
        <h2>Dmiles+: €{{ circleStation.supd_cena || "N/A" }}</h2>
        <h2>95Miles: €{{ circleStation['95_cena'] || "N/A" }}</h2>
        <h2>98Miles+: €{{ circleStation['98_cena'] || "N/A" }}</h2>
      </div>

      <div class="neste_stats" v-if="nesteStation">
        <img src="@/assets/Neste_logo.png" alt="neste_photo" width="200" height="75">
        <h2>Neste Futura D: €{{ nesteStation.d_cena || "N/A" }}</h2>
        <h2>Neste Pro Diesel: €{{ nesteStation.supd_cena || "N/A" }}</h2>
        <h2>Neste Futura 95: €{{ nesteStation['95_cena'] || "N/A" }}</h2>
        <h2>Neste Futura 98: €{{ nesteStation['98_cena'] || "N/A" }}</h2>
      </div>
    </div>
  </div>
</template>

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
