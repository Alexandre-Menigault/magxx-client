import MagChart from './MagChart.js'

/**
 * 
 * @typedef {Object} ChartData The descriptor of the data of each chart
 * @property {Date} x - The timestamp of the measurement
 * @property {number} y - The value of the magnetic component (e.g: X, Y, Z, Fv-Fs)
 * @memberof Charts
 */

/**
 * @export
 * @typedef {Object} ViewportRange The descriptor of a chart viewport range
 * @property {number} minimum - The minimum range
 * @property {number} maximum - The maximum range
 * @memberof Charts
 */

/**
* @export
* @typedef {Object} ZoomHistory The descriptor of the zoom history of charts
* @property {number} currentIndex - The current index of history (-1 means no history)
* @property {Charts.ViewportRange[]} viewportRanges - The saved viewport ranges
* @memberof Charts
*/


/**
 * @export
 * @typedef {Object} DefinitiveData The descriptor of one Mag measure 
 * @property {number} teno - The time of the measure
 * @property {number} X - The x value
 * @property {number} Y - The y value
 * @property {number} Z - The z value
 * @property {number} F - The fv value
 * @property {number} dF - The fv value
 * @memberof Charts
 */

class DefinitiveCharts {
    /**
     * Creates an instance of Charts.
     * Holds every chart
     * @param {Charts.DefinitiveData[]} plots_data
     * @param {string} parentId
     * 
     * @property {MagChart[]} charts - All charts
     * @property {HTMLElement} container - The container of all charts
     * @property {Charts.ZoomHistory} zoomHistory - The zoom history
     */
    constructor(plots_data, parentId) {
        this.charts = []
        this.container = document.getElementById(parentId)
        this.container.innerHTML = "";

        this.headers = ["dF", "X", "Y", "Z", "F",]
        this.colors = ["#000", "#080", "#0088b8", "#ff8c00", "#9400d3"]
        this.__createPlots(plots_data)
    }

    /**
     * Creates or updates all plots from the data sent by the server
     * @param {Charts.DefinitiveData[]} jsonData - The data transmited by the server. Json formated
     * @private
     */
    __createPlots(jsonData) {

        this.zoomHistory = {
            currentIndex: -1,
            viewportRanges: []
        }
        let i = 0;
        for (let header of this.headers) {
            /** @type {Charts.ChartData[]} */
            const chartData = jsonData.reduce((data, line, j) => {
                const y = parseFloat(line[header]);
                if (y < 99999) {
                    const x = parseInt(line.teno);
                    data.push({ x, y });
                }
                return data
            }, [])
            // Si les plots existent déjà, on évite de les recréer à nouveau, on modifie juste le jeu de données
            if (this.charts[i] != undefined) this.charts[i].updateData(chartData);
            else {
                const c = new MagChart(chartData, {
                    label: `${header} value`,
                    type: header, color: this.colors[i] != undefined ? this.colors[i] : this.colors[0],
                    dispalayLabels: i == this.headers.length - 1
                }, this)
                this.charts.push(c);
                c.chart.render()
            }
            i++;
        }

    }

    /**
     * Zooms in chart<br/>
     * If [chart]{@link Magchart} is provided, add current viewport range and erase remaining history <br/>
     * If not, if there is still history, increment index and returns true <br/>
     * If no history remains, returns false
     * 
     * @param {MagChart} [chart=null]
     * 
     * @returns {boolean}
     */
    zoomIn(chart = null) {

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

    /**
     * Zooms out all charts according to {@link Charts.ZoomHistory} <br/>
     * If history index is less than 0 zoom out fails and returns false <br/>
     * Returns true otherwise <br/>
     * @returns {boolean}
     */
    zoomOut() {
        if (this.zoomHistory.currentIndex <= -1)
            return false
        this.zoomHistory.currentIndex--;
        return true;
    }

    /**
     * Reset the {@link Charts.ZoomHistory} to it's default value
     */
    resetZoom() {
        this.zoomHistory.currentIndex = -1;
        this.zoomHistory.viewportRanges = [];
    }
}

export default DefinitiveCharts