<script>
import { Line } from 'vue-chartjs';

export default {
  props: ['data'],
  extends: Line,
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
  computed: {
    dates() {
      return this.data.points.map((point) => new Date(point.timestamp).toUTCString());
    },
    values() {
      return this.data.points.map((point) => point.speed);
    },
    options() {
      return {
        animation: {
          duration: 0,
        },
        hover: {
          animationDuration: 0,
        },
        responsiveAnimationDuration: 0,
        aspectRatio: 1,
      };
    },
    chartData() {
      return {
        labels: this.dates,
        datasets: [{
          label: 'Knots',
          data: this.values,
          borderWidth: 1,
        }],
      };
    },
  },
};

</script>
