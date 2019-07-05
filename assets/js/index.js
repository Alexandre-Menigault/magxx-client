import Charts from "./Charts.js";
import Button from './components/buttonComponent.js';
import Component from './components/baseComponent.js';
import NavLink from './components/navLinkComponent.js';

window.addEventListener("DOMContentLoaded", (event) => {


    // ================== Start UI creation =================

    $("#datetimepicker1").val("")
    $("#datetimepicker2").val("")
    $("#datetimepicker1").datetimepicker({
        locale: 'fr',
        useCurrent: "minute",
        icons: {
            time: 'fa fa-clock',
            today: 'fa fa-calendar-check',
        },
        buttons: {
            showToday: true,
        },
        maxDate: moment("2019-06-24T23:59:59.999"),
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
        maxDate: moment("2019-06-24T23:59:59.999"),
        minDate: moment("2019-01-01T00:00:00.000"),
        keepInvalid: true
    });

    let lastDate = "";
    let datetimepicker1LastUpdate = Date.now();

    const selector = document.getElementById("dateRangeSelector")
    $("#datetimepicker1").datetimepicker("date", moment().format("DD/MM/YYYY H:mm"))
    $("#datetimepicker2").datetimepicker("date", $("#datetimepicker1").datetimepicker("date").add(parseInt(selector.value[0]), selector.value[1]))
    $("#datetimepicker1").on("hide.datetimepicker", prepareFetch)

    $("#dateRangeSelector").change((e) => {
        $("#datetimepicker2").datetimepicker("date", $("#datetimepicker1").datetimepicker("date").add(parseInt(e.target.value[0]), e.target.value[1]))
        prepareFetch()
    })

    function prepareFetch(e) {
        const time = Date.now();
        if (time - datetimepicker1LastUpdate > 1000) {
            datetimepicker1LastUpdate = time;
            lastDate = $("#datetimepicker1").val()
            const selector = document.getElementById("dateRangeSelector")
            if (selector.value[1] == "d") $("#datetimepicker1").datetimepicker("date", $("#datetimepicker1").datetimepicker("date").set({ hour: 0, minute: 0, second: 0, millisecond: 0 }))
            $("#datetimepicker2").datetimepicker("date", $("#datetimepicker1").datetimepicker("date").add(parseInt(selector.value[0]), selector.value[1]));
            if (selector.value[1] == "d") $("#datetimepicker2").datetimepicker("date", $("#datetimepicker2").datetimepicker("date").subtract(1, "second"));
            $("#datetimepicker1").datetimepicker("hide");
            const posix = $("#datetimepicker1").datetimepicker("date").toDate().getTime() / 1000;
            fetchAndPlot("raw", posix)

        }
    }

    let charts = null;
    const navbarConiatiner = document.getElementById("navbarContainer")
    const navbarLink = new NavLink("Nav link", "#", { active: true })
    navbarLink.draw(navbarConiatiner)

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

    /**
     * 
     * @param {string} type 
     * @param {number} posix 
     */
    function fetchAndPlot(type, posix) {
        let file = `http://localhost/magxx/api/data/CLF3/${posix}/${type}?interval=${$("#dateRangeSelector").val()}`;
        // Appel de l'api (asynchrone)
        fetch(file)
            .then((response) => { return response.json() })
            .then((resJson) => {
                resJson.pop(); // TO-FIX: On retire le dernier élement car il est vide
                if (resJson[0].type === "raw") {
                    // On réutilise le plot déjà exisnant en lui passant un nouveau jeu de données
                    if (charts != null) charts.__createPlots(resJson)
                    else {
                        charts = new Charts(resJson, "magxx_plots");
                        resJson = null; // Libère la mémoire (TO-MONITOR: est-ce utile ?)
                    }
                } else {
                    // TODO: display env and log data in tables instead of displaying error
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
                }
            });
    }
})