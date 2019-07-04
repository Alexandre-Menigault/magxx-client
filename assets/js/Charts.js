import MagChart from './MagChart.js'

/**
 * 
 * @typedef {Object} ChartData The descriptor of the data of each chart
 * @property {Date} x - The timestamp of the measurement
 * @property {number} y - The value of the magnetic component (e.g: X, Y, Z, Fv-Fs)
 */


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
 *
 * @export
 * @class Charts
 * @property {MagChart[]} charts - All charts
 * @property {HTMLElement} container - The container of all charts
 */
class Charts {



    /**
     * Creates an instance of Charts.
     * Holds every chart
     * @param {MagData[]} plots_data 
     * @param {string} parentId
     */
    constructor(plots_data, parentId) {
        this.charts = []
        this.container = document.getElementById(parentId)
        this.container.innerHTML = "";
        this.__createPlots(plots_data)
    }

    /**
     * Creates or updates all plots from the data sent by the server
     * @param {MagData[]} jsonData - The data transmited by the server. Json formated
     * @private
     */
    __createPlots(jsonData) {
        let headers = jsonData[0].header
        // On supprime les headers posix et ms pour ne pas créer de plots avec ces données
        headers.splice(0, 2)
        const colors = jsonData[0].colors;
        let i = 0;
        for (let header of headers) {
            /** @type {ChartData[]} */
            const chartData = jsonData.reduce((data, line, j) => {
                if (j !== 0) {
                    const x = new Date(line.t * 1000);
                    const y = parseFloat(line[header]);
                    data.push({ x, y });
                }
                return data
            }, [])
            // Si les plots existent déjà, on évite de les recréer à nouveau, on modifie juste le jeu de données
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

export default Charts