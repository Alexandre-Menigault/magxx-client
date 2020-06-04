import NumberValidator from "../../validators/numberValidator.js";
import DateTimeValidator from "../../validators/dateTimeValidator.js";
import config from "../../config.js";
import fetchTimeout from "./vendor/fetch-timeout.js";
import Teno from "./teno.js";


window.addEventListener("DOMContentLoaded", (event) => {


    let lastObsUsed = window.localStorage.getItem("lastObsUsed");
    if (lastObsUsed == undefined) window.localStorage.setItem("lastObsUsed", '[]')
    let lastUser = window.localStorage.getItem("lastUser");
    if (lastUser == undefined) { window.localStorage.setItem("lastUser", '{}'); lastUser = '{}' }

    // document.getElementById('baseline-form').reset()


    $('#input-start-date,#input-end-date').focusin(function (e) {
        e.preventDefault()
        $(e.target).datetimepicker("show")
    })
    $('#input-start-date,#input-end-date').focusout(function (e) {
        $(e.target).datetimepicker("hide")
    })

    $('.needs-validation').on("input", (function (e) {
        validateForm()
    }))

    $('#input-button-compute').click(function (e) {
        computeBaseline();
    })


    fetchObsList();

    function computeBaseline() {
        const payload = {}
        const start_date = $('#input-start-date').val().split('-')
        const end_date = $('#input-end-date').val().split('-')
        payload.obs = $('#input-obs').val()
        payload.start_teno = Teno.fromYYYYMMDDHHMMSS({ yyyy: parseInt(start_date[0]), mmmm: parseInt(start_date[1]), dddd: parseInt(start_date[2]), hh: 0, mm: 0, ss: 0 }).teno
        payload.end_teno = Teno.fromYYYYMMDDHHMMSS({ yyyy: parseInt(end_date[0]), mmmm: parseInt(end_date[1]), dddd: parseInt(end_date[2]), hh: 0, mm: 0, ss: 0 }).teno
        payload.stiv = $('#input-stiv').val()
        payload.observations_number = $('#input-observations-number').val()
        payload.angles = [$('#input-angle1').val(), $('#input-angle2').val(), $('#input-angle3').val()]
        payload.noiseXYZF = {
            x: $('#input-noiseXYZF-x').val(),
            y: $('#input-noiseXYZF-y').val(),
            z: $('#input-noiseXYZF-z').val(),
            f: $('#input-noiseXYZF-f').val()
        }
        payload.noiseDIF = {
            d: $('#input-noiseDIF-d').val(),
            i: $('#input-noiseDIF-i').val(),
            f: $('#input-noiseDIF-f').val()
        }


        const $validateButton = $('#input-button-compute')
        $validateButton.addClass("disabled")
        $validateButton.prop("disabled", true)
        const startTime = Date.now();
        $.ajax({
            url: location.protocol + "//" + location.hostname + config.serverBaseUrl + '/api/baseline/test',
            method: 'POST',
            data: JSON.stringify(payload),
            success: function (data, status) {
                alert("Success")

                $validateButton.removeClass("disabled")
                $validateButton.prop("disabled", false)
                // document.getElementById('baseline-form').reset()
                console.log(data)
                console.log(`Ellpsed time ${(Date.now() - startTime) / 1000} ms`);
            },
            error(xhr, status, error) {
                alert("Error")
                console.log(error)

                $validateButton.removeClass("disabled")
                $validateButton.prop("disabled", false)

                console.log(`Ellpsed time ${(Date.now() - startTime) / 1000} s`);
                console.log(`Ellpsed time ${(Date.now() - startTime) / 60000} min`);
            }
        })
    }


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