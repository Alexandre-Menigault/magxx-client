import MagChart from './MagChart.js'

export default class Charts {

    /**
     * 
     * @typedef {Object} MagData The descriptor of one Mag measure 
     * @property {number} posix - The timestamp of the measure (UTC)
     * @property {number} x - The x value
     * @property {number} y - The y value
     * @property {number} z - The z value
     * @property {number} f - The fv value
     */

    /**
     * 
     * @typedef ChartData
     * @property {Date} x
     * @property {number} y
     */

    /**
     * Creates an instance of Plots.
     * @param {MagData[]} plots_data
     * @param {string} parentId
     * @memberof Plots
     */
    constructor(plots_data, parentId) {
        this.charts = []
        this.parentId = parentId;
        this.container = document.getElementById(parentId)
        this.container.innerHTML = "";
        this.__createPlots(plots_data)
    }

    /**
     * Creates or updates all plots from the data sent by the server
     * @param {MagData[]} jsonData 
     */
    __createPlots(jsonData) {
        const headers = ["x", "y", "z", "f"]
        const colors = ["#080", "#008b8b", "#ff8c00", "#9400d3"]
        let i = 0;
        for (let header of headers) {
            /** @type {ChartData[]} */
            const chartData = jsonData.map((line) => {
                const x = new Date(line.posix * 1000 - (2 * 60 * 60 * 1000));
                const y = parseFloat(line[header]);
                return { x, y }
            });
            if(this.charts[i] != undefined) this.charts[i].updateData(chartData);
            else {
                const c = new MagChart(chartData, { label: `${header} value`, type: header, color: colors[i] }, this)
                this.charts.push(c);
                c.chart.render()
            }
            i++;
        }
    }

}