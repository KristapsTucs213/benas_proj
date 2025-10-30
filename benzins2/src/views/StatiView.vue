<template>
  <div class="stats-background py-5">
    <div class="container">
      
      <div v-if="!user" class="text-center">
        <h2 class="text-muted">Please log in to see your stats.</h2>
      </div>

      
      <div v-else>
        <h1 class="display-5 fw-bold text-dark text-center mb-4">Jūsu stati</h1>

        <div class="row justify-content-center g-2">

          
          <div class="col-md-3">
            <div class="card fuel-card shadow-lg border-0 p-4 text-center">
              <h3 class="fw-bold text-success">Visbiežāk apmeklētā stacija</h3>
              <img
                v-if="popularstation"
                :src="stationImage"
                class="img-fluid mb-3"
                alt="Popular Station"
              />
              <p v-else class="fs-6 text-muted">Nav degvielas uzpildes vēstures</p>
            </div>
          </div>

          
          <div class="col-md-3">
            <div class="card fuel-card shadow-lg border-0 p-4 text-center">
              <h3 class="fw-bold text-success">Vidēji nobraukti litri nedēļā</h3>
              <p v-if="avgLiters !== null" class="fs-1 fw-bold">{{ avgLiters }}</p>
              <p v-else class="fs-6 text-muted">Nav datu</p>
            </div>
          </div>

          
          <div class="col-md-3">
            <div class="card fuel-card shadow-lg border-0 p-4 text-center">
              <h3 class="fw-bold text-success">Vidēji iztērēti € nedēļā</h3>
              <p v-if="avgSpent !== null" class="fs-1 fw-bold">{{ avgSpent }}</p>
              <p v-else class="fs-6 text-muted">Nav datu</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      user: null,
      popularstation: "",
      avgLiters: null,
      avgSpent: null,
    };
  },
  computed: {
    stationImage() {
      if (!this.popularstation) return null;
      try {
        return require(`@/assets/${this.popularstation}`);
      } catch (e) {
        return null;
      }
    },
  },
  async mounted() {
    
    const userData = localStorage.getItem("user");
    if (!userData) return;

    this.user = JSON.parse(userData);

    try {
      const accountId = this.user.id;

      
      const stationResp = await axios.get(`http://localhost:5001/top-station/${accountId}`);
      if (stationResp.data.hasHistory) {
        const stationName = stationResp.data.station.toLowerCase();
        if (stationName.includes("viada")) this.popularstation = "Viada_logo.jpg";
        else if (stationName.includes("circle")) this.popularstation = "Circle_K_logo_2015.svg.png";
        else if (stationName.includes("nest")) this.popularstation = "Neste_logo.png";
        else this.popularstation = "";
      }

      
      const statsResp = await axios.get(`http://localhost:5001/monthly-stats/${accountId}`);
      if (statsResp.data.hasData) {
        this.avgLiters = statsResp.data.avgLiters;
        this.avgSpent = statsResp.data.avgSpent;
      }

    } catch (err) {
      console.error("Error fetching stats:", err);
      this.popularstation = "";
      this.avgLiters = null;
      this.avgSpent = null;
    }
  },
};
</script>

<style scoped>
.fuel-card {
  height: 220px;
  max-width: 300px;
  margin: auto;
  border-radius: 20px;
  padding: 20px;
}


.row.g-2 {
  gap: 10px;
}


.fuel-card p.fs-1.fw-bold {
  font-size: 2.5rem !important;
}
</style>
