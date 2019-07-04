export default class MagChart {

    /**
     * 
     * @typedef ChartData
     * @property {Date} x
     * @property {number} y
     */

    /**
     *Creates an instance of Chart.
     * @param {ChartData[]} data
     * @param {Object} options
     * @param {Charts} parent
     * @memberof MagChart
     */
    constructor(data, options, parent) {
        this.canvas = document.createElement("div");
        this.canvas.id = "canvas" + options.type
        this.canvas.classList.add("canvas-container", "mx-0", "container-fluid", "bd-highlight")
        this.canvas.ondblclick = this.doubleClickHandler.bind(this);
        this.canvas.onmousedown = this.mouseDownHandler.bind(this);
        this.canvas.onmouseup = this.mouseUpHandler.bind(this);
        this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
        this.canvas.oncontextmenu = function (e) { return false; }
        this.parent = parent
        this.parent.container.appendChild(this.canvas)
        this.options = options;
        this.data = data;

        this.initchart();

        this._striplines = [-1, -1]
        this._isSelecting
    }

    updateData(newData) {
        this.chart.destroy(); // Destroy previous chart to prevent memory leaks
        this.data = null;
        this.data = newData;
        this.chart = null;
        this.initchart();
        this.chart.render()
    }

    initchart() {
        this.chart = new CanvasJS.Chart(this.canvas, {
            culture: "fr",
            axisY: {
                includeZero: false
            },
            axisX: {
                valueFormatString: "DD MMM YYYY HH:mm:ss",
                labelFormatter: (e) => {
                    // return ""
                    return CanvasJS.formatDate(e.value - (-e.value.getTimezoneOffset() * 60 * 1000), "DD MMMM YYYY HH:mm:ss", e.chart.culture)
                },
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
                // xValueType: "dateTime",
                showInLegend: true,
                xValueFormatString: "DD MMMM YYYY HH:mm:ss",
            }],
            options: {
                scales: {
                    xAxes: [{ type: "time" }]
                },
            },
            panEnabled: false,
            // zoomEnabled: true,
            // zoomType: "x",
            // rangeChanging: this.resizeHandler.bind(this),
            toolTip: {
                contentFormatter: function (e) {
                    return `<strong style="color: ${e.entries[0].dataSeries.color}">
                        ${CanvasJS.formatDate(e.entries[0].dataPoint.x - (-e.entries[0].dataPoint.x.getTimezoneOffset() * 60 * 1000), "DD MMMM YYYY HH:mm:ss", e.chart.culture)}</strong>: 
                        ${e.entries[0].dataPoint.y} nT`;
                }
            },
        })
    }

    doubleClickHandler(e) {
        this._striplines = [-1, -1];
        this.resizeHandler({ trigger: "reset", chart: this.chart })
        // this.chart.render()
    }

    mouseDownHandler(e) {
        if (e.button == 0 && !this._isSelecting) {
            const c = $(this.canvas).find(".canvasjs-chart-canvas").first();
            const parentOffset = c.parent().offset();
            const relX = e.pageX - parentOffset.left;
            const xVal = Math.round(this.chart.axisX[0].convertPixelToValue(relX))
            this._striplines[0] = xVal;
            this._isSelecting = true;
        }
    }
    mouseMoveHandler(e) {
        if (e.buttons == 1 && this._isSelecting) {

            const c = $(this.canvas).find(".canvasjs-chart-canvas").first();
            const parentOffset = c.parent().offset();
            const relX = e.pageX - parentOffset.left;
            const xVal = Math.round(this.chart.axisX[0].convertPixelToValue(relX))
            this._striplines[1] = xVal;
            if (this._striplines[0] < this._striplines[1]) {
                this.chart.axisX[0].stripLines[0].set("startValue", this._striplines[0], false)
                this.chart.axisX[0].stripLines[0].set("endValue", this._striplines[1])
            } else {
                this.chart.axisX[0].stripLines[0].set("startValue", this._striplines[1], false)
                this.chart.axisX[0].stripLines[0].set("endValue", this._striplines[0])
            }

        }
    }

    mouseUpHandler(e) {
        if (e.button == 0 && this._isSelecting) {
            this._isSelecting = false;
            const startValue = this.chart.axisX[0].stripLines[0].get("startValue")
            const endValue = this.chart.axisX[0].stripLines[0].get("endValue")

            this.parent.charts.forEach((c, i) => {
                const chart = c.chart;
                chart.axisX[0].stripLines[0].set("startValue", startValue, false)
                chart.axisX[0].stripLines[0].set("endValue", endValue)
            })
        } else if (e.button == 2 && !this._isSelecting) {
            const startValue = this.chart.axisX[0].stripLines[0].get("startValue")
            const endValue = this.chart.axisX[0].stripLines[0].get("endValue")
            this.parent.charts.forEach((c, i) => {
                const chart = c.chart;

                chart.axisX[0].set("viewportMinimum", startValue, false)
                chart.axisX[0].set("viewportMaximum", endValue, false)

                chart.axisX[0].stripLines[0].set("startValue", null, false)
                chart.axisX[0].stripLines[0].set("endValue", null)
            })
            this.resizeHandler({ trigger: "zoom", axisX: this.chart.axisX, chart: this.chart })
        }
    }

    resizeHandler(e) {
        // Handle chart markers
        const count = MagChart.countVisiblePoints(this.chart, e);
        this.parent.charts.forEach((chart, i) => {
            chart = chart.chart;
            if (!chart.options.axisX)
                chart.options.axisX = {};

            if (!chart.options.axisY)
                chart.options.axisY = {};

            if (e.trigger === "reset") {
                chart.options.axisX.viewportMinimum = chart.options.axisX.viewportMaximum = null;
                chart.options.axisY.viewportMinimum = chart.options.axisY.viewportMaximum = null;
                MagChart.handleMarkers(chart, e, count)
                chart.render();
            } else if (chart !== e.chart) {
                chart.options.axisX.viewportMinimum = e.axisX[0].viewportMinimum;
                chart.options.axisX.viewportMaximum = e.axisX[0].viewportMaximum;
                MagChart.handleMarkers(chart, e, count)
                chart.render();
            } else {
                MagChart.handleMarkers(chart, e, count)
                chart.render();
            }
        })
    }

    static handleMarkers(chart, e, count) {
        chart.data[0].dataPoints.forEach((point, i) => {
            if (e.trigger != "reset" && count < 500 &&
                ((point.x >= new Date(e.chart.axisX[0].viewportMinimum)) && (point.x <= new Date(e.chart.axisX[0].viewportMaximum)))) {
                chart.data[0].dataPoints[i].markerType = "circle";
                chart.data[0].dataPoints[i].markerSize = 6;
            } else {
                chart.data[0].dataPoints[i].markerType = "none";
                chart.data[0].dataPoints[i].markerSize = null;
            }
        })
    }

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