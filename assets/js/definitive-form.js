import NumberValidator from "../../validators/numberValidator.js";
import DateTimeValidator from "../../validators/dateTimeValidator.js";
import config from "../../config.js";

import Teno from "./teno.js";
import BaselineCharts from "./BaselineCharts.js";


window.addEventListener("DOMContentLoaded", (event) => {

    let lastObsUsed = window.localStorage.getItem("lastObsUsed");
    if (lastObsUsed == undefined) window.localStorage.setItem("lastObsUsed", '[]')
    let lastUser = window.localStorage.getItem("lastUser");
    if (lastUser == undefined) { window.localStorage.setItem("lastUser", '{}'); lastUser = '{}' }

    $('#definitive-form')[0].reset();

    $('#input-year').datetimepicker({
        format: "YYYY",
    })

    $('#input-year').focusin(function (e) {
        e.preventDefault()
        $(e.target).datetimepicker("show")
    })
    $('#input-year').focusout(function (e) {
        e.preventDefault()
        $(e.target).datetimepicker("hide")
    })

    $('.needs-validation').on("input", (function (e) {
        validateForm()
    }))

    $('#input-button-compute').click(function (e) {
        computeBaseline();
    })

    fetchObsList();

    $("#input-year").on("hide.datetimepicker", fetchIntervals);
    $("#input-interval").on("change", fetchIntervalTrys);

    function fetchIntervals() {
        const year = parseInt($('#input-year').val());
        const obs = $('#input-obs').val();
        const intervalsSelector = $('#input-interval')
        fetch(location.protocol + "//" + location.hostname + config.serverBaseUrl + `/api/baseline/intervals?obs=${obs}&year=${year}`)
            .then((res) => res.json())
            .then(intervals => {
                for (let interval of intervals) {
                    intervalsSelector.append(new Option(interval, interval));
                }
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
                for (let t of trys) {
                    trysSelector.append(new Option(t, t));
                }
            })
            .catch(err => {
                console.error(err);
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