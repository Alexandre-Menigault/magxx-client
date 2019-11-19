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
 * @typedef {Object} MagData The descriptor of one Mag measure 
 * @property {number} posix - The timestamp of the measure (UTC)
 * @property {number} x - The x value
 * @property {number} y - The y value
 * @property {number} z - The z value
 * @property {number} f - The fv value
 * @memberof Charts
 */

class Charts {
    /**
     * Creates an instance of Charts.
     * Holds every chart
     * @param {Charts.MagData[]} plots_data 
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
        this.__createPlots(plots_data)
    }

    /**
     * Creates or updates all plots from the data sent by the server
     * @param {Charts.MagData[]} jsonData - The data transmited by the server. Json formated
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
            /** @type {Charts.ChartData[]} */
            const chartData = jsonData.reduce((data, line, j) => {
                if (j !== 0) {
                    const x = parseInt(line.t);
                    const y = parseFloat(line[header]);
                    data.push({ x, y });
                }
                return data
            }, [])
            // Si les plots existent déjà, on évite de les recréer à nouveau, on modifie juste le jeu de données
            if (this.charts[i] != undefined) this.charts[i].updateData(chartData);
            else {
                const c = new MagChart(chartData, {
                    label: `${header} value`,
                    type: header, color: colors[i] != undefined ? colors[i] : colors[0],
                    dispalayLabels: i == headers.length - 1
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

export default Charts