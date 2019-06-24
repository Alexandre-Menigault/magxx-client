import Plot from './Plot.js'

export default class Plots {

    /**
     * The descriptor of one Mag measure 
     * @typedef {Object} MagData
     * @property {number} posix - The timestamp of the measure (UTC)
     * @property {number} x - The x value
     * @property {number} y - The y value
     * @property {number} z - The z value
     * @property {number} f - The fv value
     */

    /**
     *Creates an instance of Plots.
     * @param {MagData[]} plots_data
     * @param {string} parentId
     * @memberof Plots
     */
    constructor(plots_data, parentId) {
        this.MODE_LINE = "lines";
        this.MODE_LINE_MARKERS = "lines+markers";
        this.mode = this.MODE_LINE
        this.container = document.createElement("div");
        this.container.classList.add("plots_container");
        document.getElementById(parentId).appendChild(this.container)
        this.__createPlots(plots_data)
    }

    /**
     * Creates or updates all plots from the data sent by the server
     * @param {MagData[]} jsonData 
     */
    __createPlots(jsonData) {
        this.container.innerHTML = "";
        const headers = ["x", "y", "z", "f"]
        const colors = ["#080", "#008b8b", "#ff8c00", "#9400d3"]
        this.isUnderRelayout = [false, false, false, false]
        const timeValues = jsonData.map((line) => new Date(line.posix * 1000 - (2 * 60 * 60 * 1000)));
        let i = 0;
        if (this.plots === undefined || this.plots.length === 0) this.plots = []
        for (let header of headers) {
            const rangeslider = i == headers.length - 1 ? true : false;
            const width = window.innerWidth;
            const headerValues = jsonData.map((line) => line[header]);
            if (this.plots[i] != undefined) {
                this.plots[i].updateData(timeValues, headerValues, `${header} values`)
            } else {
                const p = new Plot(timeValues, headerValues, width, `${header} values`, colors[i], rangeslider)
                this.plots.push(p);

                p.div.on("plotly_relayout", function (ed) {
                    this.relayout(ed);
                }.bind(this));
                p.div.oncontextmenu = function () {
                    return false;
                }
                p.div.addEventListener("mouseup", function (e) {
                    if (e.button !== 2) return;
                    e.preventDefault()
                    this.restyle(e.currentTarget);
                }.bind(this))
            }
            i++;

        }
        for (let p of this.plots) {
            this.container.appendChild(p.div);
        }

    }

    clear() {
        for (let p of this.plots) {
            Plotly.purge(p.div);
        }
    }
    /**
     * Restyle one plot
     * @param {HTMLElement} target
     * @memberof Plots
     */
    restyle(target) {
        const m = this.mode == this.MODE_LINE ? this.MODE_LINE_MARKERS : this.MODE_LINE;
        this.mode = m
        Plotly.restyle(target, { mode: [m] }, [0])
    }

    relayout(ed) {
        this.plots.forEach((plot, i) => {
            if (!this.isUnderRelayout[i]) {
                let x = plot.div.layout.xaxis;
                //ed["width"] = 0.8 * window.innerWidth;
                if (ed["xaxis.autorange"] && x.autorange) return;
                // Relayout selected plot
                if (ed["xaxis.range"] != undefined) {
                    if (ed["xaxis.range"][0] != x.range[0] || ed["xaxis.range"][1] != x.range[1]) {
                        this.isUnderRelayout[i] = true
                        Plotly.relayout(plot.div, ed).then(() => this.isUnderRelayout[i] = false);
                    }
                }
                // Relayout other plots
                else if ((x.range[0] != ed["xaxis.range[0]"] || x.range[1] != ed["xaxis.range[1]"])) {
                    this.isUnderRelayout[i] = true
                    // Remove the useless yaxix range, keep each plot y range
                    ed["yaxis.range[0]"] = undefined;
                    ed["yaxis.range[1]"] = undefined;
                    Plotly.relayout(plot.div, ed).then(() => this.isUnderRelayout[i] = false);
                }
            }
        });
    }
}