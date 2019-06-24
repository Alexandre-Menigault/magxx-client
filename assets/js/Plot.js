export default class Plot {
    constructor(xValues, yValues, height, title = "", color = "#00f", slider = false) {
        this.div = document.createElement("div");
        this.div.classList.add("plot")
        this.x = xValues;
        this.y = yValues;
        this.height = height;
        this.slider = slider ? {} : null;
        this.title = title;
        this.color = color;
        this.visiblepoints = []
        this.initplot();

    }
    
    updateData(xValues, yValues, title) {
        this.x = xValues;
        this.y = yValues;
        this.title = title;
        this.initplot()
    }

    initplot() {
        this.plot = Plotly.react(this.div, [
            {
                x: this.x,
                y: this.y,
                mode: "lines", //lines, markers or lines+markers
                name: this.title,
                type: "scattergl", // scatter is good but recreates it own context after each redraw, so it's pretty slow for plotting a lot pf data
                line: {
                    color: this.color
                }
            }],
            {
                autosize: false,
                showlegend: true,
                legend: {
                    x: 0,
                    y: 1.5,
                    orientation: "h",
                    font: {
                        color: this.color
                    },
                },
                xaxis: {
                    rangeslider: this.slider,
                },
                yaxis: {
                    // Keep fixed range or autorange ?
                    // fixedrange: true,
                    autorange: true,
                },
                // height: this.slider ? 250+100 : 250,
                width: this.height,
            },
            {
                displayModeBar: false,
                scrollZoom: true,
                locale: 'fr',
                responsive: true,   // Slow
            },
        ).then(p => { this.plot = p })
    }

    getAllVisiblePoints() {

        const points = []
        const range =[new Date(this.plot.layout.xaxis.range[0]), new Date(this.plot.layout.xaxis.range[1])] 
        this.plot.data[0].x.forEach((x, i) => {
            if (x >= range[0] && x <= range[1]) {
                points.push({ x: x, y: plot.data[0].y[i] })
            }
        })
        return points

    }
    countAllVisiblePoints() {
        let points = 0
        const range =[new Date(this.plot.layout.xaxis.range[0]), new Date(this.plot.layout.xaxis.range[1])] 
        this.plot.data[0].x.forEach((x, i) => {
            if (x >= range[0] && x <= range[1]) {
                points++;
            }
        })
        return points
    }
}