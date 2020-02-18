import TenoFormatter from "./tenoFormtter.js";
import Teno from "./teno.js";

class BaselineChart {

    constructor(data, options, parent) {
        this.canvas = document.createElement("div");
        this.canvas.id = "canvas" + options.type;
        this.canvas.classList.add("canvas-container", "mx-0", "container-fluid", "bd-highlight")
        this.parent = parent;
        this.parent.container.appendChild(this.canvas);
        this.options = options;
        this.data = data;

        this.initchart();
    }

    initchart() {
        this.chart = new CanvasJS.Chart(this.canvas, {
            culture: 'fr',
            axisY: {
                includeZero: false,
                valueFormatString: "000000.0"
            },
            axisX: {
                labelFormatter: (e) => {
                    if (!this.options.displayLabels) return "";
                    return TenoFormatter.format(Teno.toYYYYMMDDHHMMSS(parseInt(e.value)), "%Y-%m-%D %H:%M:%S")
                },
                labelAngle: 0,
            },
            legend: {
                dockInsidePlotArea: false,
                verticalAlign: "top",
                horizontalAlign: "left"
            },
            data: [{
                type: "scatter",
                markerType: "cross",
                dataPoints: this.data,
                color: this.options.color,
                legendText: this.options.label,
                xValueType: "number",
                showInLegend: true,
            },
                // {
                //     type: "line",
                //     markerType: "none",
                //     dataPoints: this.data,
                //     lineDashType: "dot",
                //     color: this.options.color,
                //     legendText: this.options.label,
                //     xValueType: "number",
                //     showInLegend: false,
                // }
            ],
            zoomEnabled: true,
            zoomType: "x",
            toolTip: {
                contentFormatter: function (e) {
                    return `<strong style="color: ${e.entries[0].dataSeries.color}">
                        ${TenoFormatter.format(Teno.toYYYYMMDDHHMMSS(e.entries[0].dataPoint.x), "%Y-%m-%D %H:%M:%S")}</strong>: 
                        ${e.entries[0].dataPoint.y} nT`;
                }
            },
        })
    }

}

export default BaselineChart