import NumberValidator from "../../validators/numberValidator.js";
import DateTimeValidator from "../../validators/dateTimeValidator.js";
import config from "../../config.js";
import fetchTimeout from "./vendor/fetch-timeout.js";
import BaselineCharts from "./BaselineCharts.js";

window.addEventListener("DOMContentLoaded", (event) => {
    let lastObsUsed = window.localStorage.getItem("lastObsUsed");
    if (lastObsUsed == undefined) window.localStorage.setItem("lastObsUsed", '[]')
    let lastUser = window.localStorage.getItem("lastUser");
    if (lastUser == undefined) { window.localStorage.setItem("lastUser", '{}'); lastUser = '{}' }

    document.getElementById('abs-mes-form').reset()

    $('#input-date').focusin(function (e) {
        e.preventDefault()
        $('#input-date').datetimepicker("show")
    })
    $('#input-date').focusout(function () {
        $('#input-date').datetimepicker("hide")
    })
    // $('#input-date').on('hide.datetimepicker', function (e) { console.log(e) })
    const obs_selector = document.getElementById("input-obs");
    const observer_selector = document.getElementById("input-observer");
    obs_selector.onchange = function (ev) {
        fetchObsConfig(obs_selector.value);
    }

    document.onkeyup = function (ev) {
        try {
            faker.locale = "fr";
            if (ev.key === "r") {
                generateFakeData();
            }
        } catch (e) { }
    }

    function generateFakeData() {
        const decimal = $("input[data-type='decimal']")
        const time = $("input[data-type='time']")
        for (let input of decimal) {
            input = $(input);
            let min = 0;
            if (input.data("negative") == true) {
                min = -400;
            }
            const precision = parseInt(input.data("decimal-precision"));
            input.val(`${faker.random.number({ min: min, max: 400 })}.${faker.random.number({ min: 0, max: Math.pow(10, precision) - 1 })}`)
        }
        for (let input of time) {
            input = $(input);
            let hour = faker.random.number({ min: 0, max: 23 });
            if (hour < 10) hour = `0${hour}`
            let min = faker.random.number({ min: 0, max: 59 });
            if (min < 10) min = `0${min}`
            let sec = faker.random.number({ min: 0, max: 59 });
            if (sec < 10) sec = `0${sec}`
            input.val(`${hour}:${min}:${sec}`);
        }
        validateForm()

    }

    observer_selector.onchange = function (ev) {
        if (obs_selector.value != "-1")
            fetchUser(observer_selector.value);
    }

    $('#input-button-test').click(function (e) {
        testMeasure()
    })
    $('#input-button-submit').click(function (e) {
        submitForm();
    })
    $('#button-modal-save').click(function (e) {
        submitForm(() => {
            $('#results-modal').modal("hide");
        });
    })

    // $('select.needs-validation').change(function (e) {
    //     validateForm()
    // })
    $('.needs-validation').on("input", (function (e) {
        validateForm()
    }))

    fetchObsList();
    fetchObserverList();
    obs_selector.selectedIndex = 0;

    function displayTestResults(measure1, measure2) {
        return `
            <div class="d-flex flex-row">
                <div class="p-2 flex-fill text-center">
                    <p class="font-weight-bold">Measure 1</p>
                    <ul class="list-unstyled">
                        <li><label class="font-weight-bold float">Date: </label>${measure1[2]}</li>
                        <li><label class="font-weight-bold">Observer: </label>${measure1[13]}</li>
                        <li><label class="font-weight-bold">H0: </label>${measure1[3]}</li>
                        <li><label class="font-weight-bold">D0: </label>${measure1[4]}</li>
                        <li><label class="font-weight-bold">Z0: </label>${measure1[5]}</li>
                        <li><label class="font-weight-bold">F0: </label>${measure1[6]}</li>
                        <li><label class="font-weight-bold">D: </label>${measure1[8]}</li>
                        <li><label class="font-weight-bold">I: </label>${measure1[10]}</li>
                        <li><label class="font-weight-bold">F: </label>${measure1[12]}</li>
                    </ul>
                </div>
                <div class="p-2 flex-fill text-center">
                    <p class="font-weight-bold">Measure 2</p>
                    <ul class="list-unstyled">
                        <li><label class="font-weight-bold float">Date: </label>${measure2[2]}</li>
                        <li><label class="font-weight-bold">Observer: </label>${measure2[13]}</li>
                        <li><label class="font-weight-bold">H0: </label>${measure2[3]}</li>
                        <li><label class="font-weight-bold">D0: </label>${measure2[4]}</li>
                        <li><label class="font-weight-bold">Z0: </label>${measure2[5]}</li>
                        <li><label class="font-weight-bold">F0: </label>${measure2[6]}</li>
                        <li><label class="font-weight-bold">D: </label>${measure2[8]}</li>
                        <li><label class="font-weight-bold">I: </label>${measure2[10]}</li>
                        <li><label class="font-weight-bold">F: </label>${measure2[12]}</li>
                    </ul>
                </div>
            </div>
            
            <div id="test_measure_baseline"></div>
        `
    }

    function testMeasure() {
        const res = getFormData();
        $('#input-button-test').addClass("disabled").attr("disabled", "true")
        $('#results-modal .modal-body').html(`<h5>Loading ...</h5>`);
        $('#results-modal .btn').addClass("disabled").attr("disabled", "true");
        $('#results-modal').modal("show");
        $.ajax({
            url: config.serverBaseUrl + '/api/measure/test',
            method: 'POST',
            data: JSON.stringify(res),
            // dataType: "json",
            // contentType: 'plain/text',

            success: function (data, status) {
                // displaySuccessAlert(data);
                console.log(data);
                /** @type {string[]} */
                const measure1 = data[0].split(",").map(d => d.trim());
                let measure2 = new Array(14).fill("N/A");
                if (data.length == 2) {
                    measure2 = data[1].split(",").map(d => d.trim());
                }
                $('#input-button-test').removeClass("disabled").removeAttr("disabled")
                $('#results-modal .modal-body').html(displayTestResults(measure1, measure2));
                LoadBaseline(res.obs, parseInt(res.date.split("-")[0]))
                $('#results-modal .btn').removeClass("disabled").removeAttr("disabled");
            },
            error(xhr, status, error) {
                console.log(error)
                $('#input-button-test').removeClass("disabled").removeAttr("disabled")
                if (error == "timeout") {
                    const now = new Date();
                    console.error("[" + now.toLocaleDateString() + " " + now.toLocaleTimeString() + "]", "Absolute measurement", error)
                    displayErrorAlert("Impossible de contacter le serveur, veuillez réessayer plus tard", "Envoi de la mesure absolue annulée !");
                } else {
                    displayErrorAlert("Erreur lors du test de la mesure", xhr.responseText);
                    console.error(xhr.responseText)
                }
                validateForm();
            },
        })

    }


    // TODO: Add test point to the plots
    function LoadBaseline(obs, year) {
        fetch(config.serverBaseUrl + `/api/measure?obs=${obs}&year=${year}`)
            .then(res => res.json())
            .then(data => {
                new BaselineCharts(data, 'test_measure_baseline')
            })
    }

    function fetchObsList() {
        // TODO: cache response
        fetch(config.serverBaseUrl + "/api/observatories").then((res) => {
            return res.json()
        }).then((obs) => {
            const selector = $('#input-obs');
            const lastObs = JSON.parse(window.localStorage.getItem("lastObsUsed"));
            // Add last used observatories to the list
            if (lastObs.length > 0) {
                for (let i = lastObs.length - 1; i >= 0; i--) {
                    selector.prepend(new Option(lastObs[i].obs, lastObs[i].obs))
                }
                let lastUsedOption = new Option("Last used", "");
                lastUsedOption.disabled = true
                selector.prepend(lastUsedOption)
            }
            for (let index = 0; index < obs.length; index++) {
                const o = obs[index];
                if (!lastObs.find((obsObj) => obsObj.obs == o)) { // Prevent adding obs already in the last used observatories list
                    selector.append(new Option(o, o));
                }
            }
        })
    }
    function fetchObserverList() {
        // TODO: cache response
        fetch(config.serverBaseUrl + "/api/users").then((res) => {
            return res.json()
        }).then((observers) => {
            const selector = $('#input-observer');
            try {
                faker.locale = "fr";
                observers.push({
                    name: faker.fake("{{name.firstName}} {{name.lastName}}"),
                    login: faker.name.firstName(),
                })
            } catch (e) { }
            // Add last used observatories to the list
            if (lastUser != '{}') {
                selector.find('option[selected]')[0].selected = false;
                const parsedLastUser = JSON.parse(lastUser);
                selector.prepend(new Option(parsedLastUser["name"], parsedLastUser["login"], true))
                let lastObserverOption = new Option("Last observer", "");
                lastObserverOption.disabled = true
                selector.prepend(lastObserverOption)
            }
            for (let index = 0; index < observers.length; index++) {
                const o = observers[index];
                if (o["login"] != JSON.parse(lastUser)["login"]) { // Prevent adding observer already in the last observer list
                    selector.append(new Option(o["name"], o["login"]));
                }
            }
        })
    }

    function fetchObsConfig(obs) {
        fetch(`${config.serverBaseUrl}/api/observatory/${obs}`)
            .then(res => { return res.json() })
            .then((obs_config) => {

                const lastObs = JSON.parse(window.localStorage.getItem("lastObsUsed"));
                if (!lastObs.find((obsObj) => obsObj.obs == obs)) lastObs.push({ obs: obs, date: Date.now() });
                window.localStorage.setItem("lastObsUsed", JSON.stringify(lastObs))

                $('#input-DI-Flux').val(obs_config["di-flux_ref"]);
                $('#input-DI-Flux-sensitivity').val(obs_config["di-flux_sensitivity"]);
                $('#input-azimuth-ref').val(obs_config["azimmuth_reference"]);
                const fp_fs = obs_config["fa-fm"];
                if (fp_fs != null) {
                    $('#input-fp-fs').val(obs_config["fa-fm"]);
                    $('#input-fabs-fp').val("0");
                }
                $("#pillar-meas-manual .form-control:required").removeAttr("needs-validation").removeAttr("required").removeClass("is-valid").removeClass("is-invalid").attr("disabled", "true").val("");
                validateForm();
            })
    }
    function fetchUser(user) {
        fetchTimeout(`${config.serverBaseUrl}/api/users/${user}`, {}, 100, "Fetch users timeout")
            .then(res => { return res.json() })
            .then((user) => {
                const lastUser = JSON.parse(window.localStorage.getItem("lastUser"));
                if (lastUser != {} && lastUser["login"] != user["login"]) {
                    window.localStorage.setItem("lastUser", JSON.stringify(user))
                }

            })
            .catch((err) => {
                console.error("[" + now.toLocaleDateString() + " " + now.toLocaleTimeString() + "]", "Fetch users", error + " - ", "Emitted by " + observer)
                displayErrorAlert("Impossible de contacter le serveur, veuillez réessayer plus tard", "Impossible de récupérer la liste des utilisateurs");
            })
    }

    function validateForm() {
        let needsValidation = $(".needs-validation")
        let _isFormValid = true;
        for (let item of needsValidation) {
            let isItemValid = true;
            item = $(item)
            if (item.data("type") === "date") {
                isItemValid = validateItem(item, DateTimeValidator.DateTime(item.val(), DateTimeValidator.DATE_FORMAT))
            }
            else if (item.data("type") === "time") {
                isItemValid = validateItem(item, DateTimeValidator.DateTime(item.val(), DateTimeValidator.TIME_FORMAT_COLUMN) || DateTimeValidator.DateTime(item.val(), DateTimeValidator.TIME_FORMAT_POINT))
            }
            else if (item.data("type") === "decimal") {
                const isNegativeAllowed = Boolean(item.data("negative"));
                const precision = parseInt(item.data("decimal-precision"));
                isItemValid = validateItem(item, NumberValidator.Decimal(item.val(), precision, isNegativeAllowed));
            } else {
                // Observatory, observer and DI-Flux
                if (item.val() != null && item.val() != "") {
                    isItemValid = validateItem(item, true)
                } else {
                    isItemValid = validateItem(item, false)
                }
            }

            if (!isItemValid) _isFormValid = false;
        }
        isFormValid(_isFormValid)

    }

    function isFormValid(condition) {
        const $item = $('#abs-mes-form')
        const $validateButton = $('#input-button-submit')
        const $testButton = $('#input-button-test')
        if (condition) {
            $item.removeClass('invalid')
            $item.addClass("valid")
            $validateButton.removeClass("disabled")
            $validateButton.prop("disabled", false)
            $testButton.removeClass("disabled")
            $testButton.prop("disabled", false)
            return true
        } else {
            $item.removeClass('valid')
            $item.addClass("invalid")
            $validateButton.addClass("disabled")
            $validateButton.prop("disabled", true)
            $testButton.addClass("disabled")
            $testButton.prop("disabled", true)
            return false
        }
    }


    function getFormData() {
        const $form = $('#abs-mes-form');
        if ($form.hasClass("valid")) {
            const obs = $('#input-obs').val();
            const observer = $('#input-observer').val();
            const date = $('#input-date').val();

            const pillarMeasurements = []

            // Get all pilars measurements
            const azimuth_ref = $('#input-azimuth-ref').val();
            for (let i = 1; i <= 6; i++) {
                pillarMeasurements.push({
                    "value": $(`#input-df-value-${i}`).val(),
                    "time": $(`#input-df-time-${i}`).val(),
                })
            }

            const measurementA = {}

            // Get Start and end mark sighting
            measurementA["sighting"] = [$('#input-cible-v1').val(), $('#input-cible-v2').val(), $('#input-cible-v3').val(), $('#input-cible-v4').val()]
            measurementA["inclination"] = $('#input-start-a-i-pos').val()
            measurementA["declination"] = $('#input-start-a-d-pos').val()

            measurementA["residues"] = []
            for (let i = 1; i <= 8; i++) {
                measurementA["residues"].push({
                    "value": $(`#input-a-value-${i}`).val(),
                    "time": $(`#input-a-time-${i}`).val(),
                })
            }
            const measurementB = {}

            // Get Start and end mark sighting
            measurementB["sighting"] = [$('#input-cible-v3').val(), $('#input-cible-v4').val(), $('#input-cible-v5').val(), $('#input-cible-v6').val()]
            measurementB["inclination"] = $('#input-start-b-i-pos').val()
            measurementB["declination"] = $('#input-start-b-d-pos').val()

            measurementB["residues"] = []
            for (let i = 1; i <= 8; i++) {
                measurementB["residues"].push({
                    "value": $(`#input-b-value-${i}`).val(),
                    "time": $(`#input-b-time-${i}`).val(),
                })
            }


            const fp_fs = $('#input-fp-fs').val();
            const fabs_fp = $('#input-fabs-fp').val();

            const res = {
                obs,
                observer,
                date,
                pillarMeasurements,
                azimuth_ref,
                measurementA,
                measurementB,
                fp_fs,
                fabs_fp,

            }
            return res;
        }
    }

    function submitForm(callback) {
        const res = getFormData();
        $('#input-button-submit').addClass("disabled")
        $('#input-button-submit').disabled = true;
        $.ajax({
            url: config.serverBaseUrl + '/api/measure/',
            method: 'POST',
            data: JSON.stringify(res),
            // dataType: "json",
            // contentType: 'application/json',
            timeout: 10000, // 10s
            success: function (data, status) {
                callback()
                displaySuccessAlert("La mesure a bien été créée");
                resetForm($('#abs-mes-form'))
            },
            error(xhr, status, error) {
                console.log(error)
                if (error == "timeout") {
                    const now = new Date();
                    console.error("[" + now.toLocaleDateString() + " " + now.toLocaleTimeString() + "]", "Absolute measurement", error)
                    displayErrorAlert("Impossible de contacter le serveur, veuillez réessayer plus tard", "Envoi de la mesure absolue annulée !");
                } else {
                    displayErrorAlert("Erreur lors de l'envoi de la mesure", xhr.responseJSON);
                    console.error(xhr.responseJSON)
                }
                validateForm();
            },
        })
    }

    function validateItem($item, condition) {
        // Si le champ c'est pas obligatoire et non rempli, on ne le marque pas comme validé
        if (!$item.prop("required") && $item.val() == "") {
            $item.removeClass('is-invalid')
            $item.removeClass("is-valid")
            return true
        }
        else if (condition) {
            $item.removeClass('is-invalid')
            $item.addClass("is-valid")
            return true
        } else {
            $item.removeClass('is-valid')
            $item.addClass("is-invalid")
            return false
        }
    }

    function resetForm($form) {
        const items = $(".is-valid,is-invalid");
        for (const item of items) {
            $(item).removeClass("is-valid", "is-invalid")
        }
        $form.trigger("reset");
        $('#input-button-submit').addClass("disabled").prop("disabled", true)
        const selector = $('#input-observer');
        selector.val(JSON.parse(lastUser)["login"])
    }

    function displaySuccessAlert(message, callback, fixed = false) {
        const alert = document.createElement('div');
        alert.classList.add('alert', "alert-success", "alert-fixed-sm", "alert-dismissible");
        alert.innerHTML = `
<strong>Success: </strong> ${message}
<div class="progress progress-fixed-bottom">
    <div class="progress-bar bg-success  progress-bar-striped progress-bar-animated" role="progressbar">
    </div>
</div>
<button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
</button>`;
        alert.setAttribute("role", "alert")
        alert.id = "success-alert"

        document.body.appendChild(alert);
        if (!fixed) {
            const bar = $(".progress-bar");
            bar.animate({
                width: 0
            }, {
                duration: 5000,
                easing: "linear",
                complete: function () {
                    document.body.removeChild(alert);
                    if (typeof callback == "function") callback();
                }
            })

        }
    }
    function displayErrorAlert(messageHead, messageBody, fixed = false) {
        const alert = document.createElement('div');
        alert.classList.add('alert', "alert-danger", "alert-fixed-sm", "alert-dismissible");
        alert.innerHTML = `
<strong>Error: </strong> ${messageHead}
<hr>
${messageBody}
<div class="progress progress-fixed-bottom">
    <div class="progress-bar bg-danger  progress-bar-striped progress-bar-animated" role="progressbar">
    </div>
</div>
<button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
</button>`;
        alert.setAttribute("role", "alert")
        alert.id = "error-alert"

        document.body.appendChild(alert);
        if (!fixed) {
            const bar = $(".progress-bar");
            bar.animate({
                width: 0
            }, {
                duration: 5000,
                easing: "linear",
                complete: function () {
                    document.body.removeChild(alert);
                }
            })

        }
    }
})