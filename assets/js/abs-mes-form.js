window.addEventListener("DOMContentLoaded", (event) => {
    let lastObsUsed = window.localStorage.getItem("lastObsUsed");
    if (lastObsUsed == undefined) window.localStorage.setItem("lastObsUsed", '[]')
    let lastUser = window.localStorage.getItem("lastUser");
    if (lastUser == undefined) window.localStorage.setItem("lastUser", '{}')

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

    observer_selector.onchange = function (ev) {
        if (obs_selector.value != "-1")
            fetchUser(observer_selector.value);
    }

    fetchObsList();
    fetchObserverList();
    obs_selector.selectedIndex = 0;

    function fetchObsList() {
        // TODO: cache response
        fetch("http://localhost/magxx/api/observatories").then((res) => {
            return res.json()
        }).then((obs) => {
            const selector = $('#input-obs');
            const lastObs = JSON.parse(window.localStorage.getItem("lastObsUsed"));
            // Add last used observatories to the list
            if (lastObs.length > 0) {
                for (let i = lastObs.length - 1; i >= 0; i--) {
                    selector.prepend(new Option(lastObs[i].obs, lastObs[i].obs))
                }
                let lastUsedOption = new Option("Last used", "Last used");
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
        fetch("http://localhost/magxx/api/users").then((res) => {
            return res.json()
        }).then((observers) => {
            const selector = $('#input-observer');
            // Add last used observatories to the list
            if (lastUser != '{}') {
                const parsedLastUser = JSON.parse(lastUser);
                selector.prepend(new Option(parsedLastUser["name"], parsedLastUser["login"]))
                let lastObserverOption = new Option("Last observer", "Last observer");
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
        fetch(`http://localhost/magxx/api/observatory/${obs}`)
            .then(res => { return res.json() })
            .then((obs_config) => {

                const lastObs = JSON.parse(window.localStorage.getItem("lastObsUsed"));
                if (!lastObs.find((obsObj) => obsObj.obs == obs)) lastObs.push({ obs: obs, date: Date.now() });
                window.localStorage.setItem("lastObsUsed", JSON.stringify(lastObs))

                $('#input-DI-Flux').val(obs_config["di-flux_ref"]);
                $('#input-DI-Flux-sensitivity').val(obs_config["di-flux_sensitivity"]);
                $('#input-azimuth-ref').val(obs_config["azimmuth_reference"]);
            })
    }
    function fetchUser(user) {
        fetch(`http://localhost/magxx/api/users/${user}`)
            .then(res => { return res.json() })
            .then((user) => {

                const lastUser = JSON.parse(window.localStorage.getItem("lastUser"));
                if (lastUser != {} && lastUser["login"] != user["login"]) {
                    window.localStorage.setItem("lastUser", JSON.stringify(user))
                }


            })
    }
})