<template>
  <div class="profile-container">
    <div v-if="!user">
      <h2>Please log in to see your profile.</h2>
    </div>

    <div v-else>
      <h1>Hello, {{ user.first_name }} {{ user.last_name }} 👋</h1>

      <div class="actions">
        <button @click="editMode = !editMode" class="btn btn-primary">
          {{ editMode ? "Cancel" : "Edit Account Info" }}
        </button>
      </div>

      <div v-if="editMode" class="edit-section">
        <h3>Edit Information</h3>
        <form @submit.prevent="updateInfo">
          <input v-model="user.first_name" placeholder="First Name" />
          <input v-model="user.last_name" placeholder="Last Name" />
          <input v-model="user.email" placeholder="Email" />
          <button type="submit" class="btn btn-success">Save</button>
        </form>
      </div>

      <hr />

      <div class="add-form">
        <h3>Add New Fuel Purchase</h3>
        <form @submit.prevent="addSpending">
          <select v-model="newSpending.uzpildes_stacijas_id" required>
            <option disabled value="">Select Gas Station</option>
            <option v-for="station in stations" :key="station.id" :value="station.id">
              {{ station.tanka_vards }}
            </option>
          </select>

          <input
            type="number"
            v-model="newSpending.total_spent"
            placeholder="Total Spent (€)"
            step="0.01"
            required
          />
          <input
            type="number"
            v-model="newSpending.liters"
            placeholder="Liters"
            step="0.1"
            required
          />
          <button type="submit" class="btn btn-success">Add</button>
        </form>
      </div>

      <h2>Fuel Spending History</h2>

      <div class="table-container">
    <table class="table table-striped spending-table">
        <thead>
        <tr>
            <th>Station</th>
            <th>Total Spent (€)</th>
            <th>Liters</th>
        </tr>
        </thead>
        <tbody class="infobinpo">
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
        const response = await axios.get("http://localhost:5000/uzpildes_stacijas");
        this.stations = response.data;
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    },

    async fetchSpending() {
      try {
        const response = await axios.get(`http://localhost:5001/spending/${this.user.id}`);
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

        this.newSpending = { uzpildes_stacijas_id: "", total_spent: "", liters: "" };
        this.fetchSpending();
      } catch (error) {
        console.error("Error adding spending:", error);
      }
    },

    async updateInfo() {
      try {
        await axios.put(`http://localhost:5001/account/${this.user.id}`, this.user);
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
