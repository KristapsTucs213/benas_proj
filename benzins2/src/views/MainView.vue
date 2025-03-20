<template>
  <div class="about">
    <h1 class="title">DEGVIELA CENAS</h1>
    <div class="stati-box">
      <div class="viada_stats" v-if="viadaStation">
        <h1 class="viada">Viada</h1>
        <h2>D: €{{ viadaStation.d_cena }}</h2>
        <h2>Super D: €{{ viadaStation.supd_cena }}</h2>
        <h2>95L: €{{ viadaStation.devinipieci_cena }}</h2>
        <h2>98: €{{ viadaStation.deviniastoni_cena }}</h2>
      </div>
      <div class="circle_stats" v-if="circleStation">
        <h1 class="circle">Circle K</h1>
        <h2>D: €{{ circleStation.d_cena }}</h2>
        <h2>Super D: €{{ circleStation.supd_cena }}</h2>
        <h2>95L: €{{ circleStation.devinipieci_cena }}</h2>
        <h2>98: €{{ circleStation.deviniastoni_cena }}</h2>
      </div>
      <div class="neste_stats" v-if="nesteStation">
        <h1 class="neste">Neste</h1>
        <h2>D: €{{ nesteStation.d_cena }}</h2>
        <h2>Super D: €{{ nesteStation.supd_cena }}</h2>
        <h2>95L: €{{ nesteStation.devinipieci_cena }}</h2>
        <h2>98: €{{ nesteStation.deviniastoni_cena }}</h2>
      </div>
    </div>
  </div>
</template>

<script>
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

        // Find specific stations by name
        this.viadaStation = this.stations.find(station => station.tanka_vards.toLowerCase() === "viada");
        this.circleStation = this.stations.find(station => station.tanka_vards.toLowerCase() === "circle k");
        this.nesteStation = this.stations.find(station => station.tanka_vards.toLowerCase() === "neste");
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

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
}

.title {
  margin-top: 20px;
  text-align: center;
}

.stati-box {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  width: 50%;
}

.viada_stats,
.circle_stats,
.neste_stats {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 5px;
}

.viada, .circle, .neste {
  font-size: 25px;
  font-weight: bold;
}
</style>
