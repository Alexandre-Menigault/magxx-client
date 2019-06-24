import Charts from "./Charts.js";
// import MagChart from "./MagChart.js"
window.addEventListener("DOMContentLoaded", (event) => {
    /**
     * @type {Charts}
     */
    let charts = null;
    const fetchDataButton = document.getElementsByClassName("fetchDataButton");
    for (let button of fetchDataButton) {
        button.onclick = function () {
            fetchAndPlot(button.id)
        }
    }

    CanvasJS.addCultureInfo("fr", {
        decimalSeparator: ",",
        digitGroupSeparator: "",
        panText: "Bouger",
        resetText: "Restaurer",
        days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
        shortDays: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
        months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        ShoreMonths: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Jui", "Août", "Sept", "Oct", "Nov", "Déc"]
    })

    function fetchAndPlot(type) {
        let file = "";
        if (type === "5min") file = "http://localhost/magxx/upload/file/CLF320190614040500.raw.csv";
        else if (type === "1day") file = "http://localhost/magxx/upload/file/CLF320190614.raw.csv";
        const plot_time = Date.now();
        fetch(file)
            .then((response) => { return response.json() })
            .then((resJson) => {
                resJson.pop();
                console.log("Init charts duration: ", Date.now() - plot_time, "ms")
                if(charts != null) charts.__createPlots(resJson)
                charts = new Charts(resJson, "magxx_plots");
                console.log("Got all data", "Begin plotting ...");
            });
    }
})