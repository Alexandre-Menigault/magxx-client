import BaselineChart from "./BaselineChart.js"

class BaselineCharts {

    /**
     * @typedef {Object} BaselineData
     * @property {number} id
     * @property {string} tag
     * @property {string} date
     * @property {number} h0
     * @property {number} d0
     * @property {number} z0
     * @property {number} f0
     * @property {number} tenoD
     * @property {number} D
     * @property {number} tenoI
     * @property {number} I
     * @property {number} tenoF
     * @property {number} F
     * @property {string} observer
     * @memberof BaselineCharts
     */

    /**
     * 
     * @param {BaselineData[]} plots_data 
     * @param {string[]} headers 
     * @param {string} parentId 
     */
    constructor(plots_data, parentId, isBaseline = false) {
        this.charts = [];
        this.container = document.getElementById(parentId);
        this.container.innerHTML = '';
        this.isBaseline = isBaseline;
        if (isBaseline) {
            this.headers = ["H", "D", "Z", "F", "dF"];
            this.times = ["teno", "teno", "teno", "teno", "teno"];
            this.colors = ["#080", "#0088b8", "#ff8c00", "#9400d3", "#000"]

        } else {
            this.headers = ["h0", "d0", "z0", "f0"];
            this.times = ["tenoI", "tenoD", "tenoI", "tenoF"];
            this.colors = ["#080", "#0088b8", "#ff8c00", "#9400d3"]

        }
        this._createPlots(plots_data);
    }

    /**
     * @param {BaselineData[]} jsonData 
     */
    _createPlots(jsonData) {
        let charts = []
        for (let i = 0; i < this.headers.length; i++) {
            let data = [];
            const header = this.headers[i];
            // jsonData[this.times[i]] => the time of the header component
            // e.g => jsonData[this.times[0]] = tenoI
            for (const d of jsonData) {
                // Prevent adding rejected measurements
                if (d["tag"] == 'V') data.push({ x: parseInt(d[this.times[i]]), y: parseFloat(d[header]) })
                else if (this.isBaseline) {
                    const y = parseFloat(d[header])
                    if (y < 99999.0)
                        data.push({ x: parseInt(d[this.times[i]].teno), y })
                }
            }
            // console.log(data);
            charts.push(new BaselineChart(data, {
                label: `${header} value`,
                type: header,
                color: this.colors[i],
                displayLabels: i == this.headers.length - 1
            }, this));
        }
        // Doing this at the end to improve preformence
        for (const c of charts) {
            c.chart.render()
        }
    }
}

export default BaselineCharts;