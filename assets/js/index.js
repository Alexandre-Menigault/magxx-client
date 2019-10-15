import Charts from "./Charts.js";
import Button from './components/buttonComponent.js';
import Component from './components/baseComponent.js';
import NavLink from './components/navLinkComponent.js';
import NavBar from './components/navBarComponent.js';

window.addEventListener("DOMContentLoaded", (event) => {


    let pages = { graph: "/magxx-client/", env: "/magxx-client/env.html", log: "/magxx-client/log.html", abs: "/magxx-client/abs-mes.html" }

    const nav = document.getElementById("navbar")
    const navbar = new NavBar({ parent: nav });
    navbar.draw();

    // ================== Start UI creation =================
    moment.locale("fr")
    $("#datetimepicker1").val("")
    $("#datetimepicker2").val("")
    $("#input-date").val("")
    $("#datetimepicker1").datetimepicker({
        locale: 'fr',
        format: "LL",
        sideBySide: true,
        // useCurrent: "minute",
        icons: {
            time: 'fa fa-clock',
            today: 'fa fa-calendar-check',
        },
        maxDate: moment("2019-08-18T23:59:59.999"),
        minDate: moment("2019-01-01T00:00:00.000"),
        tooltips: {
            today: "Ajouurd'hui",
            close: 'Fermer',
            selectMonth: 'Selectionner mois',
            prevMonth: 'Mois précédent',
            nextMonth: 'Mois suivant',
            selectYear: 'Sélectionner année',
            prevYear: 'Année précédente',
            nextYear: 'Année suivante',
            incrementHour: 'Incrémenter heure',
            pickHour: 'Choisir heure',
            decrementHour: 'Décrémenter heure',
            incrementMinute: 'Incrémenter minute',
            pickMinute: 'Choisir minute',
            decrementMinute: 'Décrémenter minute',
            incrementSecond: 'Incrémenter seconde',
            pickSecond: 'Choisir seconde',
            decrementSecond: 'Décrémenter seconde',
            selectTime: "Sélectionner temps",
            selectDate: "Sélectionner date"
        },
        keepOpen: false
    })

    $("#datetimepicker2").datetimepicker({
        locale: 'fr',
        maxDate: moment("2019-08-19T00:00:00.000"),
        minDate: moment("2019-01-01T00:00:00.000"),
        keepInvalid: true
    });

    $("#input-date").datetimepicker({
        locale: 'fr',
        format: "L",
        sideBySide: true,
        focusOnShow: false,
        keepOpen: true,
        icons: {
            time: 'fa fa-clock',
            today: 'fa fa-calendar-check',
        },
        keepInvalid: false,
        maxDate: moment(),
        minDate: moment("2019-01-01"),
        tooltips: {
            today: "Ajourd'hui",
            close: 'Fermer',
            selectMonth: 'Selectionner mois',
            prevMonth: 'Mois précédent',
            nextMonth: 'Mois suivant',
            selectYear: 'Sélectionner année',
            prevYear: 'Année précédente',
            nextYear: 'Année suivante',
            incrementHour: 'Incrémenter heure',
            pickHour: 'Choisir heure',
            decrementHour: 'Décrémenter heure',
            incrementMinute: 'Incrémenter minute',
            pickMinute: 'Choisir minute',
            decrementMinute: 'Décrémenter minute',
            incrementSecond: 'Incrémenter seconde',
            pickSecond: 'Choisir seconde',
            decrementSecond: 'Décrémenter seconde',
            selectTime: "Sélectionner temps",
            selectDate: "Sélectionner date"
        },
    })

    if (sessionStorage.getItem("startDate")) {
        const interval = sessionStorage.getItem("interval");
        $("#dateRangeSelector").val(interval)
        $("#obsSelector").val(sessionStorage.getItem("obs"))
        $("#datetimepicker1").datetimepicker("date", (moment(sessionStorage.getItem("startDate"))))
        $("#datetimepicker2").datetimepicker("date", moment(sessionStorage.getItem("startDate")).add(parseInt(interval[0]), interval[1]))
    }

    let lastDate = "";
    let datetimepicker1LastUpdate = Date.now();

    const selector = document.getElementById("dateRangeSelector")
    $("#datetimepicker1").datetimepicker("date", moment().format("DD/MM/YYYY H:mm"))
    $("#datetimepicker2").datetimepicker("date", $("#datetimepicker1").datetimepicker("date").add(parseInt(selector.value[0]), selector.value[1]))
    $("#datetimepicker1").on("hide.datetimepicker", prepareFetch);
    $("#prev-interval").click((e) => {
        $("#datetimepicker1").datetimepicker("date", $("#datetimepicker1").datetimepicker("date").subtract(parseInt(selector.value[0]), selector.value[1]))
        prepareFetch(true);
    })
    $("#next-interval").click((e) => {
        $("#datetimepicker1").datetimepicker("date", $("#datetimepicker1").datetimepicker("date").add(parseInt(selector.value[0]), selector.value[1]))
        prepareFetch(true);
    })
    $("#obsSelector").change((e) => { prepareFetch(true) });
    $("#dateRangeSelector").change((e) => {
        $("#datetimepicker2").datetimepicker("date", $("#datetimepicker1").datetimepicker("date").add(parseInt(e.target.value[0]), e.target.value[1]))
        prepareFetch(true)
    })

    function prepareFetch(force = false) {

        const time = Date.now();
        if (force || time - datetimepicker1LastUpdate > 1000) {
            datetimepicker1LastUpdate = time;
            lastDate = $("#datetimepicker1").val()
            const selector = document.getElementById("dateRangeSelector")
            if (selector.value[1] == "d") $("#datetimepicker1").datetimepicker("date", $("#datetimepicker1").datetimepicker("date").set({ hour: 0, minute: 0, second: 0, millisecond: 0 }))
            $("#datetimepicker2").datetimepicker("date", $("#datetimepicker1").datetimepicker("date").add(parseInt(selector.value[0]), selector.value[1]));
            if (selector.value[1] == "d") $("#datetimepicker2").datetimepicker("date", $("#datetimepicker2").datetimepicker("date").subtract(1, "second"));
            $("#datetimepicker1").datetimepicker("hide");
            const posix = $("#datetimepicker1").datetimepicker("date").toDate().getTime() / 1000;
            sessionStorage.setItem("startDate", $("#datetimepicker1").datetimepicker("date").toISOString());
            sessionStorage.setItem("interval", $("#dateRangeSelector").val());
            sessionStorage.setItem("obs", $("#obsSelector").val());

            if (window.location.pathname === pages.graph) {
                fetchAndPlot("raw", posix)
            } else if (window.location.pathname === pages.env) {
                fetchEnv("env", posix)
            } else if (window.location.pathname === pages.log) {
                fetchLog("log", posix)
            }
        }
    }


    let charts = null;

    //================== Abs meas form ===================

    //================== End Abs meas form ===================

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
    // ================== End UI creation =================

    function fetchEnv(type, posix) {
        let file = `${config.serverBaseUrl}/api/data/${$("#obsSelector").val()}/${posix}/${type}?interval=${$("#dateRangeSelector").val()}`;
        const loading = document.getElementById("loadingSpinner");
        loading.style.visibility = "visible"
        let done = true;
        fetch(file)
            .then((res) => {
                if (res.ok != true) done = false;
                return res.json();
            })
            .then((resJson) => {
                if (!done) {
                    displayErrorAlert(resJson.message, JSON.stringify(resJson.trace, null, 4), true);
                    loading.style.visibility = "hidden"
                    return;
                }
                resJson.pop();
                const utcOffset = moment().utcOffset();
                const table = $('#env-table');
                const body = document.querySelector("#env-table>tbody");
                body.innerHTML = "";
                const headers = resJson[0].header

                let i = 0
                for (let line of resJson) {
                    const tr = document.createElement("tr")
                    if (i !== 0) {
                        for (let header of headers) {
                            const td = document.createElement("td");
                            td.classList.add("text-center")
                            if (header == "ms") continue;
                            if (header == "t") {
                                const time = line[header] - (utcOffset * 60);
                                const date = moment(parseInt(`${time}${line["ms"]}`)).format("DD/MM/YYYY H:mm:ss.SSS");
                                td.innerText = date;
                            } else {
                                td.innerText = line[header];
                            }
                            tr.appendChild(td);
                        }
                    }
                    body.appendChild(tr);
                    i++;
                }

                loading.style.visibility = "hidden"
            });
    }

    function fetchLog(type, posix) {
        let file = `${config.serverBaseUrl}/api/data/${$("#obsSelector").val()}/${posix}/${type}?interval=${$("#dateRangeSelector").val()}`;
        const loading = document.getElementById("loadingSpinner");
        loading.style.visibility = "visible"

        let done = true;
        fetch(file)
            .then((res) => {
                if (res.ok != true) done = false;
                return res.json();
            })
            .then((resJson) => {
                if (!done) {
                    displayErrorAlert(resJson.message, JSON.stringify(resJson.trace, null, 4), true);
                    loading.style.visibility = "hidden"
                    return;
                }
                resJson.pop();
                const utcOffset = moment().utcOffset();
                const table = $('#log-table');
                const body = document.querySelector("#log-table>tbody");
                body.innerHTML = "";
                const headers = resJson[0].header

                let i = 0;
                for (let line of resJson) {
                    const tr = document.createElement("tr")
                    if (i !== 0) {
                        for (let header of headers) {
                            const td = document.createElement("td");
                            td.classList.add("text-center")
                            if (header == "ms") continue;
                            if (header == "t") {
                                const time = line[header] - (utcOffset * 60);
                                const date = moment(parseInt(`${time}${line["ms"]}`)).format("DD/MM/YYYY H:mm:ss.SSS");
                                td.innerText = date;
                            } else if (header == "Level") {
                                const p = document.createElement("p");
                                const level = line[header];
                                p.innerText = level;
                                p.style.marginBottom = "0px";
                                if (level == "INFO") p.classList.add("text-white", "bg-primary")
                                else if (level == "WARNING") p.classList.add("text-dark", "bg-warning")
                                else if (level == "ERROR") p.classList.add("text-white", "bg-danger")
                                td.appendChild(p);
                            }
                            else {
                                td.innerText = line[header];
                            }
                            tr.appendChild(td);
                        }
                    }
                    body.appendChild(tr);
                    i++;
                }

                loading.style.visibility = "hidden"
            });
    }

    /**
     * 
     * @param {string} type 
     * @param {number} posix 
     */
    function fetchAndPlot(type, posix) {
        let file = `${config.serverBaseUrl}/api/data/${$("#obsSelector").val()}/${posix}/${type}?interval=${$("#dateRangeSelector").val()}`;

        const loading = document.getElementById("loadingSpinner");
        loading.style.visibility = "visible"
        let done = true;
        // Appel de l'api (asynchrone)
        fetch(file)
            .then((res) => {
                if (res.ok != true) done = false;
                return res.json();
            })
            .then((resJson) => {
                if (!done) {
                    displayErrorAlert(resJson.message, JSON.stringify(resJson.trace, null, 4), true);
                    loading.style.visibility = "hidden"
                    return;
                }
                resJson.pop(); // TO-FIX: On retire le dernier élement car il est vide
                // On réutilise le plot déjà exisnant en lui passant un nouveau jeu de données
                if (charts != null) charts.__createPlots(resJson)
                else {
                    charts = new Charts(resJson, "magxx_plots");
                    resJson = null; // Libère la mémoire (TO-MONITOR: est-ce utile ?)
                }

                loading.style.visibility = "hidden"
            })
    }
})

function displayErrorAlert(message, trace = "", fixed = false) {
    const alert = document.createElement('div');
    alert.classList.add('alert', "alert-danger", "alert-fixed", "alert-dismissible");
    const e = new Error("Error on fetch data");
    console.error(e.message, e.stack);
    alert.innerHTML = `
<strong>Attention: </strong> Erreur lors de la récupération des données
<button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
</button>
<hr>
<pre style="max-height: 90vh; overflow-y: auto; overflox-x:none" class="mb-0"><code>
${message}
${escapeHtml(trace)}
</code></pre>`;
    alert.setAttribute("role", "alert")
    alert.id = "wrong-type-alert"

    document.body.appendChild(alert);
    if (!fixed) {
        setTimeout(() => {
            document.body.removeChild(alert);
        }, 3000)
    }
}



function escapeHtml(str) {
    var map =
    {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, function (m) { return map[m]; });
}