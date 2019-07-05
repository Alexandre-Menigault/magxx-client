import MagChart from './MagChart.js'

/**
 * 
 * @typedef {Object} ChartData The descriptor of the data of each chart
 * @property {Date} x - The timestamp of the measurement
 * @property {number} y - The value of the magnetic component (e.g: X, Y, Z, Fv-Fs)
 */

/**
 * @export
 * @typedef {Object} ViewportRange The descriptor of a chart viewport range
 * @property {number} minimum - The minimum range
 * @property {number} maximum - The maximum range
 */

/**
* @export
* @typedef {Object} ZoomHistory The descriptor of the zoom history of charts
* @property {number} currentIndex - The current index of history (-1 means no history)
* @property {ViewportRange[]} viewportRanges - The saved viewport ranges
*/


/**
 * @export
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
 * @property {ZoomHistory} zoomHistory - The zoom history
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

        this.zoomHistory = {
            currentIndex: -1,
            viewportRanges: []
        }
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

    /**
     * Zooms in chart<br/>
     * If chart is provided, 
     *
     * @param {MagChart} [chart=null]
     * @memberof Charts
     */
    zoomIn(chart = null) {

        console.log("Zoom in")
        if (chart != null) {
            if (this.zoomHistory.viewportRanges.length - 1 != this.zoomHistory.currentIndex) this.zoomHistory.viewportRanges.splice(this.zoomHistory.currentIndex + 1)
            this.zoomHistory.viewportRanges.push({
                minimum: chart.chart.axisX[0].viewportMinimum,
                maximum: chart.chart.axisX[0].viewportMaximum
            })
            this.zoomHistory.currentIndex = this.zoomHistory.viewportRanges.length - 1;
        } else {
            if (this.zoomHistory.viewportRanges.length - 1 <= this.zoomHistory.currentIndex)
                return false
            this.zoomHistory.currentIndex++;
        }
        return true
    }
    zoomOut() {
        console.log("Zoom Out")
        if (this.zoomHistory.currentIndex <= -1)
            return false
        this.zoomHistory.currentIndex--;
        return true;
    }
    resetZoom() {
        this.zoomHistory.currentIndex = -1;
        this.zoomHistory.viewportRanges = [];
    }
}

export default Charts