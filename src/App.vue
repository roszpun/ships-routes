<template>
  <div id="app">
       <div class="selector-wrapper">
         Ship route:
        <select v-model="selectedRoute" @change="drawRoute">
    <option disabled value="">Select ship route</option>
    <option v-for="(route, index) in routes" :value="index" :key="route.id">
      {{ route.from }} -> {{ route.to }}
    </option>
      </select>
      <button v-if="displayedRoute" @click="showSpeedChart = !showSpeedChart">
        {{chartText}} ship speed chart
        </button>
       </div>
        <div class="chart-wrapper" v-if="displayedRoute && showSpeedChart">
        <Chart :key="selectedRoute"
        :data="displayedRoute"
      />
     </div>
    <div class="map-wrapper">
      <googlemaps-map
        :key="selectedRoute"
        ref="gmap"
        :zoom="3"
        :center="{ lat: 0, lng: 0 }"
      >
      </googlemaps-map>
    </div>
  </div>
</template>

<script>
import Chart from './components/Chart.vue';

export default {
  name: 'App',
  components: {
    Chart,
  },
  data() {
    return {
      showSpeedChart: false,
      routes: [],
      selectedRoute: '',
      displayedPaths: [],
    };
  },
  computed: {
    displayedRoute() {
      return this.routes[this.selectedRoute];
    },
    chartText() {
      return this.showSpeedChart ? 'Hide' : 'Show';
    },
  },
  mounted() {
    this.loadCsv();
  },
  methods: {
    loadCsv() {
      this.$parser.parse('./csv.csv', {
        download: true,
        complete: ({ data }) => {
          data.shift();
          this.routes = this.parseRoutes(data);
        },
        skipEmptyLines: true,
      });
    },
    parseRoutes(routes) {
      return routes.map((route) => ({
        id: route[0],
        from: route[1],
        to: route[2],
        duration: route[3],
        points: this.parsePoints(route[4]),
      }));
    },
    parsePoints(pointsString) {
      if (pointsString === '' || !pointsString) return false;
      return JSON.parse(pointsString).map((point) => ({
        lng: point[0],
        lat: point[1],
        timestamp: point[2],
        speed: point[3],
      }));
    },
    resetPaths() {
      this.displayedPaths = [];
    },
    groupDataByThreshold(data, key, threshold) {
      return data.reduce((result, item) => {
        const prevGroup = result[result.length - 1];
        const prevItem = prevGroup[prevGroup.length - 1];
        const prevOver = prevItem[key] > threshold;
        const currOver = item[key] > threshold;
        if ((currOver && prevOver) || (!currOver && !prevOver)) {
          prevGroup.push(item);
        } else {
          result.push([item]);
        }
        return result;
      }, [[data.shift()]]);
    },
    drawPath(points) {
      const { google } = window;
      const groups = this.groupDataByThreshold(points, 'speed', 15);
      groups.forEach((group, index) => {
        const color = group[0].speed > 15 ? 'green' : 'red';
        const paths = group.map((point) => {
          const latLng = this.latLng(point.lat, point.lng);
          return { lat: latLng.lat(), lng: latLng.lng() };
        });
        if (index + 1 !== groups.length) {
          const next = groups[index + 1][0];
          const nextLatLng = this.latLng(next.lat, next.lng);
          paths.push({ lat: nextLatLng.lat(), lng: nextLatLng.lng() });
        }
        this.displayedPaths.push(
          new google.maps.Polyline({
            path: paths,
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 1.0,
            strokeWeight: 3,
          }),
        );
        this.draw();
        setTimeout(() => {
          this.$refs.gmap.$_map.panTo(paths[0]);
        }, 100);
      });
    },
    draw() {
      this.displayedPaths.forEach((path) => path.setMap(this.$refs.gmap.$_map));
    },
    latLng(lat, lng) {
      const { google } = window;
      return new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
    },
    drawRoute() {
      setTimeout(() => {
        this.resetPaths();
        this.drawPath(this.displayedRoute.points);
      }, 100);
    },
  },
};
</script>

<style lang="scss">
.chart-wrapper{
  width: 100%;
  height: 100vh !important;
  overflow: scroll;
  position: absolute;
  z-index: 1;
  background: #fff;
}
body,
html {
  padding: 0;
  margin: 0;
}

.selector-wrapper{
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 2;
  background: #fff;
  box-shadow: 0 0 15px rgba($color: #000000, $alpha: 0.2);
  padding: 15px 30px;
  border-radius: 15px;
  button{
    margin-left: 15px;
  }
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
ul {
  li {
    display: inline-block;
  }
}

.vue-google-map {
  height: 100vh;
  width: 100vw;
}
</style>
