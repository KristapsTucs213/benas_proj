<template>
  <div class="profile-background py-5">
    <div class="container">
      <div v-if="!user" class="text-center">
        <h2 class="text-muted">Please log in to see your profile.</h2>
      </div>

      <div v-else>
        <div class="text-center mb-5">
          <h1 class="display-5 fw-bold text-dark">
            Hello, {{ user.first_name }} {{ user.last_name }}
          </h1>
          <button
            @click="editMode = !editMode"
            class="btn btn-primary btn-lg mt-3"
          >
            {{ editMode ? "Cancel" : "Edit Account Info" }}
          </button>
        </div>

        <div v-if="editMode" class="card edit-card">
          <h3>Edit Information</h3>
          <form @submit.prevent="updateInfo" class="d-flex flex-column gap-3">
            <input
              v-model="user.first_name"
              placeholder="First Name"
              class="form-control"
            />
            <input
              v-model="user.last_name"
              placeholder="Last Name"
              class="form-control"
            />
            <input
              v-model="user.email"
              placeholder="Email"
              class="form-control"
            />
            <button type="submit" class="btn btn-success btn-lg">
              Save Changes
            </button>
          </form>
        </div>

        <div class="card add-card">
          <h3>Add Fuel Purchase</h3>
          <form @submit.prevent="addSpending" class="d-flex flex-column gap-3">
            <select
              v-model="newSpending.uzpildes_stacijas_id"
              required
              class="form-select"
            >
              <option disabled value="">Select Gas Station</option>
              <option
                v-for="station in stations"
                :key="station.id"
                :value="station.id"
              >
                {{ station.tanka_vards }}
              </option>
            </select>
            <input
              type="number"
              v-model="newSpending.total_spent"
              placeholder="Total Spent (€)"
              step="0.01"
              required
              class="form-control"
            />
            <input
              type="number"
              v-model="newSpending.liters"
              placeholder="Liters"
              step="0.1"
              required
              class="form-control"
            />
            <button type="submit" class="btn btn-primary btn-lg">
              Add Fuel
            </button>
          </form>
        </div>

        <!-- Fuel Spending History -->
        <h2 class="fw-bold mb-3 text-center text-dark">
          Fuel Spending History
        </h2>
        <div
          class="table-responsive shadow-lg rounded spending-table-container"
        >
          <table class="table spending-table">
            <thead>
              <tr>
                <th>Station</th>
                <th>Total Spent (€)</th>
                <th>Liters</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in spendingHistory" :key="entry.id">
                <td>{{ entry.tanka_vards }}</td>
                <td>{{ entry.total_spent }}</td>
                <td>{{ entry.liters }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "@/css/ProfileView.css";
import axios from "axios";

export default {
  name: "ProfileView",
  data() {
    return {
      user: null,
      editMode: false,
      spendingHistory: [],
      stations: [],
      newSpending: {
        uzpildes_stacijas_id: "",
        total_spent: "",
        liters: "",
      },
    };
  },
  methods: {
    async fetchUserData() {
      const userData = localStorage.getItem("user");
      if (userData) {
        this.user = JSON.parse(userData);
        await this.fetchSpending();
        await this.fetchStations();
      }
    },

    async fetchStations() {
      try {
        const response = await axios.get(
          "http://localhost:5000/uzpildes_stacijas"
        );
        this.stations = response.data;
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    },

    async fetchSpending() {
      try {
        const response = await axios.get(
          `http://localhost:5001/spending/${this.user.id}`
        );
        this.spendingHistory = response.data;
      } catch (error) {
        console.error("Error fetching spending history:", error);
      }
    },

    async addSpending() {
      if (!this.newSpending.uzpildes_stacijas_id) {
        alert("Please select a gas station!");
        return;
      }

      try {
        await axios.post("http://localhost:5001/spending", {
          account_id: this.user.id,
          uzpildes_stacijas_id: this.newSpending.uzpildes_stacijas_id,
          total_spent: this.newSpending.total_spent,
          liters: this.newSpending.liters,
        });

        this.newSpending = {
          uzpildes_stacijas_id: "",
          total_spent: "",
          liters: "",
        };
        this.fetchSpending();
      } catch (error) {
        console.error("Error adding spending:", error);
      }
    },

    async updateInfo() {
      try {
        await axios.put(
          `http://localhost:5001/account/${this.user.id}`,
          this.user
        );
        localStorage.setItem("user", JSON.stringify(this.user));
        this.editMode = false;
        alert("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating user info:", error);
      }
    },
  },
  mounted() {
    this.fetchUserData();
  },
};
</script>
