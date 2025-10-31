<template>
  <div class="station-background py-5">
    <div class="container">
      <div v-if="loading" class="text-center text-muted fs-4">
        Loading station data...
      </div>

      <div v-else-if="!station" class="text-center text-danger fs-4">
        Station not found!
      </div>

      <div v-else class="row align-items-center justify-content-center">
        <div class="col-md-4 text-center mb-4 mb-md-0">
          <img
            :src="stationImage"
            :alt="station.tanka_vards"
            class="station-logo img-fluid"
          />
        </div>

        <div class="col-md-6">
          <h1 class="fw-bold text-dark mb-3">{{ station.tanka_vards }}</h1>
>
          <div class="mb-4">
            <label class="form-label fw-semibold">Select Fuel Type:</label>
            <select
              v-model="selectedFuel"
              class="form-select shadow-sm"
            >
              <option disabled value="">Choose fuel</option>
              <option value="d_cena">Dīzeļdegviela (D)</option>
              <option value="supd_cena">Super D</option>
              <option value="95_cena">Benzīns 95</option>
              <option value="98_cena">Benzīns 98</option>
            </select>
          </div>

          <div v-if="selectedFuel" class="price-display shadow-sm p-3 rounded mb-4">
            <h4 class="fw-bold text-success mb-1">
              Cena:
            </h4>
            <p class="fs-2 fw-bold text-dark">
              €{{ station[selectedFuel] || "N/A" }}
            </p>
          </div>

          <div class="station-info-text shadow-sm p-3 rounded">
            <h5 class="fw-semibold text-primary">Kur informācija ir aktuāla🤓☝️:</h5>
            <p class="fs-5 text-muted">
              {{ fuelDescription }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import "@/css/StacijasView.css";

export default {
  name: "StacijaView",
  data() {
    return {
      station: null,
      loading: true,
      selectedFuel: "",
      defaultDescription:
        "yurr. ",
    };
  },
  computed: {
    stationImage() {
      if (!this.station) return null;
      const name = this.station.tanka_vards.toLowerCase();
      try {
        if (name.includes("viada"))
          return require("@/assets/Viada_logo.jpg");
        if (name.includes("circle"))
          return require("@/assets/Circle_K_logo_2015.svg.png");
        if (name.includes("neste"))
          return require("@/assets/Neste_logo.png");
        return require("@/assets/default_station.jpg");
      } catch {
        return require("@/assets/default_station.jpg");
      }
    },
    fuelDescription() {
      if (!this.station || !this.selectedFuel) return this.defaultDescription;

      switch (this.selectedFuel) {
        case "d_cena":
          return this.station.d_desc || this.defaultDescription;
        case "supd_cena":
          return this.station.supd_desc || this.defaultDescription;
        case "95_cena":
          return this.station["95_desc"] || this.defaultDescription;
        case "98_cena":
          return this.station["98_desc"] || this.defaultDescription;
        default:
          return this.defaultDescription;
      }
    },
  },
  async mounted() {
    const id = this.$route.params.id;
    try {
      const response = await axios.get(
        `http://localhost:5000/uzpildes_stacijas/${id}`
      );
      this.station = response.data;
    } catch (err) {
      console.error("Error fetching station:", err);
      this.station = null;
    } finally {
      this.loading = false;
    }
  },
};
</script>

