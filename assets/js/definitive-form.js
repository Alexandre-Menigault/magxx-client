import NumberValidator from "../../validators/numberValidator.js";
import DateTimeValidator from "../../validators/dateTimeValidator.js";
import config from "../../config.js";
import DefinitiveCharts from "./DefinitiveCharts.js";

import Teno from "./teno.js";


window.addEventListener("DOMContentLoaded", (event) => {

    let lastObsUsed = window.localStorage.getItem("lastObsUsed");
    if (lastObsUsed == undefined) window.localStorage.setItem("lastObsUsed", '[]')
    let lastUser = window.localStorage.getItem("lastUser");
    if (lastUser == undefined) { window.localStorage.setItem("lastUser", '{}'); lastUser = '{}' }

    $('#definitive-form')[0].reset();

    $('#input-button-compute').click(computeDefinitive);

    $('#input-year').val('')
    $('#input-year').datetimepicker()
    $('#input-year').datetimepicker({
        format: "YYYY",
        viewMode: 'years',
        maxDate: moment(),
    })
    $('#input-def-start-date').val('')
    $('#input-def-start-date').datetimepicker({
        format: "L",
        viewMode: 'days',
        sideBySide: true,
        maxDate: moment(),
    })

    $('.needs-validation').on("input", (function (e) {
        validateForm()
    }))

    fetchObsList();

    $("#input-year").on("hide.datetimepicker", fetchIntervals);
    $("#input-interval").on("change", fetchIntervalTrys);
    $("#input-intervalTry").on("change", fetchBaselineConfig);
    $("#input-def-start-date").on("hide.datetimepicker", fetchDefinitiveDay);

    function fetchIntervals() {
        const year = parseInt($('#input-year').val());
        const obs = $('#input-obs').val();
        const intervalsSelector = $('#input-interval')
        fetch(location.protocol + "//" + location.hostname + config.serverBaseUrl + `/api/baseline/intervals?obs=${obs}&year=${year}`)
            .then((res) => res.json())
            .then(intervals => {
                // Clear the selector before adding new options
                intervalsSelector.empty();
                const defaultOpt = new Option("Choose an interval", "")
                defaultOpt.disabled = true;
                intervalsSelector.append(defaultOpt)
                let isFirstElem = true;
                for (let interval of intervals) {
                    const opt = new Option(interval, interval);
                    if (isFirstElem) {
                        opt.selected = true
                        isFirstElem = false;
                    }
                    intervalsSelector.append(opt);
                }
                fetchIntervalTrys()
            })
            .catch(err => {
                console.error(err);
            })
    }

    function fetchIntervalTrys() {
        const year = parseInt($('#input-year').val());
        const obs = $('#input-obs').val();
        const interval = $('#input-interval').val();
        const trysSelector = $('#input-interval-trys')
        fetch(location.protocol + "//" + location.hostname + config.serverBaseUrl + `/api/baseline/interval-trys?obs=${obs}&year=${year}&intervalString=${interval}`)
            .then((res) => res.json())
            .then(trys => {
                // Clear the selector before adding new options
                trysSelector.empty();
                const defaultOpt = new Option("Choose an interval try", "")
                defaultOpt.disabled = true;
                trysSelector.append(defaultOpt);
                let isFirstElem = true;
                for (let t of trys) {
                    const opt = new Option(t, t);
                    if (isFirstElem) {
                        opt.selected = true
                        isFirstElem = false
                    }
                    trysSelector.append(opt);
                }
                fetchBaselineConfig();
                fetchDefinitiveTrys()
            })
            .catch(err => {
                console.error(err);
            }).finally(() => {
                validateForm();
            })
    }

    function fetchBaselineConfig() {

        const year = parseInt($('#input-year').val());
        const obs = $('#input-obs').val();
        const interval = $('#input-interval').val();
        const try_ = $('#input-interval-trys').val();

        fetch(location.protocol + "//" + location.hostname + config.serverBaseUrl + `/api/baseline/try-config?obs=${obs}&year=${year}&intervalString=${interval}&try=${try_}`)
            .then((res) => res.json())
            .then((data) => {
                displayConfigValues(data);
            })
    }

    function fetchDefinitiveTrys() {

        const year = parseInt($('#input-year').val());
        const obs = $('#input-obs').val();
        const interval = $('#input-interval').val();
        const trysSelector = $('#input-def-trys');
        fetch(`${location.protocol}//${location.hostname}${config.serverBaseUrl}/api/definitive/trys?obs=${obs}&year=${year}&intervalString=${interval}`)
            .then((res) => res.json())
            .then((trys) => {
                trysSelector.empty();
                const defaultOpt = new Option("Choose an definitve try", "")
                defaultOpt.disabled = true;
                trysSelector.append(defaultOpt);
                let isFirstElem = true;
                for (let t of trys) {
                    const opt = new Option(t, t);
                    if (isFirstElem) {
                        opt.selected = true
                        isFirstElem = false
                    }
                    trysSelector.append(opt);
                }
            })

    }

    function displayConfigValues(data) {
        $('#input-timestep').val(data.try.baseline_time_step);
        $('#input-angle1').val(data.obs.euler_a);
        $('#input-angle2').val(data.obs.euler_b);
        $('#input-angle3').val(data.obs.euler_g);

        $('#input-noiseXYZF-x').val(data.obs.noise_XYZF.X)
        $('#input-noiseXYZF-y').val(data.obs.noise_XYZF.Y)
        $('#input-noiseXYZF-z').val(data.obs.noise_XYZF.Z)
        $('#input-noiseXYZF-f').val(data.obs.noise_XYZF.F)

        $('#input-baselineMeanXYZF-x').val(data.try.mean_XYZF.X)
        $('#input-baselineMeanXYZF-y').val(data.try.mean_XYZF.Y)
        $('#input-baselineMeanXYZF-z').val(data.try.mean_XYZF.Z)
        $('#input-baselineMeanXYZF-f').val(data.try.mean_XYZF.F)

        $('#input-baselineScalingXYZF-x').val(data.try.scaling_XYZF.X)
        $('#input-baselineScalingXYZF-y').val(data.try.scaling_XYZF.Y)
        $('#input-baselineScalingXYZF-z').val(data.try.scaling_XYZF.Z)
        $('#input-baselineScalingXYZF-f').val(data.try.scaling_XYZF.F)
    }

    function computeDefinitive() {
        const $validateButton = $('#input-button-compute')
        const year = parseInt($('#input-year').val());
        const obs = $('#input-obs').val();
        const interval = $('#input-interval').val();
        const try_ = $('#input-interval-trys').val();

        $validateButton.addClass("disabled")
        $validateButton.prop("disabled", true)
        fetch(location.protocol + "//" + location.hostname + config.serverBaseUrl + `/api/definitive/compute?obs=${obs}&year=${year}&intervalString=${interval}&try=${try_}`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                alert("Compute success")
                fetchDefinitiveTrys();

            })
            .catch((err) => {
                console.error(err)
                alert("Compute error")
            }).finally(() => {
                $validateButton.removeClass("disabled")
                $validateButton.prop("disabled", false)
            })
    }

    function fetchDefinitiveDay() {

        const year = parseInt($('#input-year').val());
        const obs = $('#input-obs').val();
        const interval = $('#input-interval').val();
        const try_ = $('#input-def-trys').val();
        const $startDay = $('#input-def-start-date').val().split('-');
        const startDay = Teno.fromYYYYMMDDHHMMSS({ yyyy: parseInt($startDay[0]), mmmm: parseInt($startDay[1]), dddd: parseInt($startDay[2]), hh: 0, mm: 0, ss: 0 }).teno;

        fetch(`${location.protocol}//${location.hostname}${config.serverBaseUrl}/api/definitive/${obs}/${year}/${interval}/${try_}/${startDay}`,
            {
                headers: {
                    'Accept': "plain/text"
                }
            })
            .then((res) => res.text())
            .then((data) => {
                data = data.split(/(?:\r\n|\r|\n)/g)
                console.log(data)
                const jsonData = []
                for (let line of data) {
                    // Remove spaces
                    line = line.trim().replace("/ /g", '');
                    const lineSplit = line.split(',');
                    const teno = parseInt(lineSplit[0]);
                    const X = parseFloat(lineSplit[1]);
                    const Y = parseFloat(lineSplit[2]);
                    const Z = parseFloat(lineSplit[3]);
                    const F = parseFloat(lineSplit[4]);
                    const deltaF = F - Math.sqrt(X * X + Y * Y + Z * Z);
                    jsonData.push({
                        teno: teno,
                        X: X,
                        Y: Y,
                        Z: Z,
                        F: F,
                        dF: deltaF
                    })
                }
                new DefinitiveCharts(jsonData, "definitiveCharts");
            })
    }

    // ========= Form validation ==============
    function fetchObsList() {
        fetch(location.protocol + "//" + location.hostname + config.serverBaseUrl + "/api/observatories").then((res) => {
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

    function validateForm() {
        let needsValidation = $(".needs-validation")
        let _isFormValid = true;
        for (let item of needsValidation) {
            let isItemValid = true;
            item = $(item)
            if (item.data("type") === "date") {
                isItemValid = validateItem(item,
                    DateTimeValidator.DateTime(item.val(), DateTimeValidator.DATE_FORMAT)
                    || DateTimeValidator.DateTime(item.val(), DateTimeValidator.YEAR_FORMAT)
                )
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
        const $item = $('#baseline-form')
        const $validateButton = $('#input-button-compute')
        if (condition) {
            $item.removeClass('invalid')
            $item.addClass("valid")
            $validateButton.removeClass("disabled")
            $validateButton.prop("disabled", false)
            return true
        } else {
            $item.removeClass('valid')
            $item.addClass("invalid")
            $validateButton.addClass("disabled")
            $validateButton.prop("disabled", true)
            return false
        }
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
})