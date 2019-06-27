import Charts from "./Charts.js";
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
        ShoreMonths: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"]
    })

    function fetchAndPlot(type) {
        let file = "";
        const posix = Date.UTC(2019, 5, 13) / 1000; // Attention, les mois commencent à zéro
        if (type === "5min") file = `http://localhost/magxx/api/data/CLF3/${posix}/env`;
        else if (type === "1day") file = `http://localhost/magxx/api/data/CLF3/${posix}/raw`;
        const plot_time = Date.now();
        fetch(file)
            .then((response) => { return response.json() })
            .then((resJson) => {
                resJson.pop();
                if (resJson[0].type === "raw") {
                    console.log("Init charts duration: ", Date.now() - plot_time, "ms")
                    if (charts != null) charts.__createPlots(resJson, true)
                    charts = new Charts(resJson, "magxx_plots");
                    console.log("Got all data", "Begin plotting ...");
                } else {
                    const alert = document.createElement('div');
                    alert.classList.add('alert', "alert-danger", "alert-fixed", "alert-dismissible");
                    const e = new Error("Error on fetch raw data. Got env, expected raw");
                    console.error(e);
                    alert.innerHTML = `
<strong>Attention: </strong> Erreur lors de la récupération des données
<button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
</button>
<hr>
<pre class="mb-0"><code>
${e.message}
${e.stack}
</code></pre>`;
                    alert.setAttribute("role", "alert")
                    alert.id = "wrong-type-alert"

                    document.body.appendChild(alert);
                    setTimeout(() => {
                        document.body.removeChild(alert);
                    }, 3000)
                    // Don't plot log or env data
                    // const magxx_text = document.getElementById("magxx_text");
                    // magxx_text.textContent = JSON.stringify(resJson, null, 4);
                }
            });
    }
})