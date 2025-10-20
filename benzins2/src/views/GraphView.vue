<template>
  <div class="graph-container">
    <h1 class="text-2xl font-bold mb-4">Degvielas cenu vēsture</h1>

    <label for="fuelType" class="block mb-2 font-semibold">Izvēlies degvielas tipu:</label>
    <select id="fuelType" class="mb-4 p-2 border rounded">
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
