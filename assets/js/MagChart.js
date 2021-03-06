import Charts from "./Charts.js"

import Teno from "./teno.js"
import TenoFormatter from "./tenoFormtter.js"

class MagChart {

    /**
     * @typedef {Object} ChartEvent
     * @property {Chart} chart 
     * @property {string} trigger
     * @property {Object[]} axisX
     * @memberof MagChart
     */

    /**
     * @typedef {Object} ChartOptions
     * 
     * @property {string} label - The legend of chart
     * @property {string} type - The type of data [eg. X, Y, Z, F]
     * @property {string} color - The color of the lines
     * @property {boolean} [dispalayLabels=false] - Whether display the labels at the bottom of the chart or not
     * @memberof MagChart
     */

    /**
     *Creates an instance of Chart.
     * @param {Charts.ChartData[]} data
     * @param {ChartOptions} options
     * @param {Charts} parent
     * 
     * @property {HTMLElement} canvas - The container of the canvas
     * @property {Charts} parent
     * @property {ChartOptions} options
     * @property {Charts.ChartData[]} data
     */
    constructor(data, options, parent) {
        this.canvas = document.createElement("div");
        this.canvas.id = "canvas" + options.type
        this.canvas.classList.add("canvas-container", "mx-0", "container-fluid", "bd-highlight")
        this.canvas.ondblclick = this.doubleClickHandler.bind(this);
        this.canvas.onwheel = this.wheelHandler.bind(this)
        this.canvas.oncontextmenu = function (e) { return false; }
        this.parent = parent
        this.parent.container.appendChild(this.canvas)
        this.options = options;
        this.options.dispalayLabels = options.dispalayLabels || false;
        this.data = data;

        this.initchart();

        this._striplines = [-1, -1]
        this._isSelecting
    }

    /**
     * Updates the data used by the plot instead of creating an other one<br/>
     * Chart must exists before updating
     * 
     * @param {Charts.ChartData} newData
     */
    updateData(newData) {
        this.chart.destroy(); // Destroy previous chart to prevent memory leaks
        this.data = null;
        this.data = newData;
        this.chart = null;
        this.initchart();
        this.chart.render()
    }


    /**
     * Initialize the plots with data<br/>
     * Configures the Canvasjs lib
     *
     */
    initchart() {

        this.chart = new CanvasJS.Chart(this.canvas, {
            culture: "fr",
            axisY: {
                includeZero: false,
                valueFormatString: "00000.0"
            },
            axisX: {
                // valueFormatString: "DD MM YYYY HH:mm:ss",
                labelFormatter: (e) => {
                    if (!this.options.dispalayLabels) return "";
                    return TenoFormatter.format(Teno.toYYYYMMDDHHMMSS(parseInt(e.value)), "%Y-%m-%D %H:%M:%S")
                },
                labelAngle: 0,
                stripLines: [{
                    color: "#000",
                    showOnTop: true,
                    thickness: 2,
                    opacity: 0.5,
                    lineDashType: "solid",
                }]
            },
            legend: {
                dockInsidePlotArea: false,
                verticalAlign: "top",
                horizontalAlign: "left",
            },
            data: [{
                type: "line",
                color: this.options.color,
                legendText: this.options.label,
                markerType: "circle",
                markerSize: null,
                dataPoints: this.data,
                xValueType: "number",
                showInLegend: true,
            }],
            panEnabled: false,
            // ===============================================================
            // If we want to use zoom only, not select and zoom on right click
            // ===============================================================
            zoomEnabled: true,
            zoomType: "x",
            rangeChanging: this.resizeHandler.bind(this),
            // ===============================================================
            toolTip: {
                contentFormatter: function (e) {
                    return `<strong style="color: ${e.entries[0].dataSeries.color}">
                        ${TenoFormatter.format(Teno.toYYYYMMDDHHMMSS(e.entries[0].dataPoint.x), "%Y-%m-%D %H:%M:%S")}</strong>: 
                        ${e.entries[0].dataPoint.y} nT`;
                }
            },
        })
    }

    /**
     * Reset the zoom level of the chart on double click on the chart<br/>
     * Calls the resize handler afterwards
     * @param {MouseEvent} e
     */
    doubleClickHandler(e) {
        this._striplines = [-1, -1];
        this.parent.resetZoom()
        this.resizeHandler({ trigger: "reset", chart: this.chart })
    }

    /**
     * Zooms in or out in the zoom {@link Charts.ZoomHistory} of the {@link Charts|parent}
     *
     * @param {WheelEvent} e
     */
    wheelHandler(e) {
        if (e.deltaY > 0) {
            if (this.parent.zoomOut())
                if (this.parent.zoomHistory.currentIndex == -1)
                    this.resizeHandler({ trigger: "reset", chart: this.chart })
                else
                    this.resizeHandler({
                        trigger: "zoom-out", chart: this.chart, axisX: [{
                            viewportMaximum: this.parent.zoomHistory.viewportRanges[this.parent.zoomHistory.currentIndex].maximum,
                            viewportMinimum: this.parent.zoomHistory.viewportRanges[this.parent.zoomHistory.currentIndex].minimum,
                        }]
                    })
        } else if (e.deltaY < 0) {
            if (this.parent.zoomIn())
                this.resizeHandler({
                    trigger: "zoom", chart: this.chart, axisX: [{
                        viewportMaximum: this.parent.zoomHistory.viewportRanges[this.parent.zoomHistory.currentIndex].maximum,
                        viewportMinimum: this.parent.zoomHistory.viewportRanges[this.parent.zoomHistory.currentIndex].minimum,
                    }]
                })
        }
    }



    /**
     * Zoom-in the chart or reset the zoom level by default
     *
     * @param {MagChart.ChartEvent} e
     */
    resizeHandler(e) {
        const count = MagChart.countVisiblePoints(this.chart, e);
        if (e.trigger === "pan") return
        if (e.trigger === "zoom") this.parent.zoomIn(this);
        for (let chart of this.parent.charts) {
            chart = chart.chart;
            if (e.trigger === "reset") {
                chart.options.axisX.viewportMinimum = chart.options.axisX.viewportMaximum = null;
                chart.options.axisY.viewportMinimum = chart.options.axisY.viewportMaximum = null;
                chart.data[0].type = "line"
            } else if (chart != this.chart) {
                chart.options.axisX.viewportMinimum = e.axisX[0].viewportMinimum;
                chart.options.axisX.viewportMaximum = e.axisX[0].viewportMaximum;
            }
            if (chart.data[0].type == "line" && count <= 500) chart.data[0].type = "spline";
            else if (chart.data[0].type == "spline" && count > 500) chart.data[0].type = "line";
            MagChart.handleMarkers(chart, e, count)
        }

        for (let chart of this.parent.charts) {
            chart.chart.render()
        }
    }

    /**
     * Handles where the markers will be displayed<br/>
     * When the number of displayed points is less than the count param it puts markers on the displayed points<br/>
     * Else it clears all the markers 
     *
     * @static
     * @param {Chart} chart
     * @param {MagChart.ChartEvent} e
     * @param {number} count - Max number of displayed markers. Prevents high memory usage
     */
    static handleMarkers(chart, e, count) {
        chart.data[0].dataPoints.forEach((point, i) => {
            if (e.trigger != "reset" && count < 500 &&
                ((point.x >= new Date(e.axisX[0].viewportMinimum)) && (point.x <= new Date(e.axisX[0].viewportMaximum)))) {
                chart.data[0].dataPoints[i].markerType = "circle";
                chart.data[0].dataPoints[i].markerSize = 6;
            } else {
                chart.data[0].dataPoints[i].markerType = "none";
                chart.data[0].dataPoints[i].markerSize = null;
            }
        })
    }

    /**
     *  Count the number of visible points in the plot<br/>
     * Returns null if the event trigger is "reset"
     *
     * @static
     * @param {Chart} chart
     * @param {MagChart.ChartEvent} e
     * @returns {number|null} Number of displayed points in the chart. Or null if trigger is "reset"
     */
    static countVisiblePoints(chart, e) {
        if (e.trigger == "reset") return null
        const min = new Date(e.axisX[0].viewportMinimum);
        const max = new Date(e.axisX[0].viewportMaximum);
        let count = 0;
        chart.data[0].dataPoints.forEach((point, i) => {
            if ((point.x >= min) && (point.x <= max)) {
                count++;
            }
        });
        return count;
    }


}

export default MagChart;