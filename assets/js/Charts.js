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
        let headers = jsonData[0].header
        headers.splice(0, 2); // On retire les deux premiers headers qui sont les headers de temps posix + les milisecondes
        const colors = jsonData[0].colors;
        let i = 0;
        for (let header of headers) {
            /** @type {ChartData[]} */
            const chartData = jsonData.reduce((data, line, j) => {
                if (j !== 0) {
                    const x = new Date(line.t*1000);
                    const y = parseFloat(line[header]);
                    data.push({ x, y });
                }
                return data
            }, [])
            if (this.charts[i] != undefined) this.charts[i].updateData(chartData);
            else {
                const c = new MagChart(chartData, { label: `${header} value`, type: header, color: colors[i] != undefined ? colors[i] : colors[0] }, this)
                this.charts.push(c);
                c.chart.render()
            }
            i++;
        }
    }

}