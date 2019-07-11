import Component from "./baseComponent.js";
import NavLink from "./navLinkComponent.js";

let pages = { graph: "/magxx-client/", env: "/magxx-client/env.html", log: "/magxx-client/log.html" }

class NavBarComponent extends Component {

    /**
     * Creates an instance of NavLinkComponent.
     * @param {Object} options
     * 
     * @extends Component
     * @memberof Components
     */
    constructor(options) {
        super(options);
        this.baseHTMLElement = options.parent;
        this.init();
    }

    init() {
        // Navbar-brand
        this.baseHTMLElement.innerHTML = "";
        const brand = document.createElement("a");
        brand.classList.add("navbar-brand");
        brand.href = "#"
        brand.innerText = "Magxx";
        this.baseHTMLElement.appendChild(brand);

        // Input collapse
        const collapseButton = document.createElement("button");
        collapseButton.classList.add("navbar-toggler");
        collapseButton.type = "button";
        collapseButton.dataset.toggle = "collapse";
        collapseButton.dataset.target = "#navbarNav";
        collapseButton.setAttribute("aria-controls", "navbarNav");
        collapseButton.setAttribute("aria-expanded", false);
        collapseButton.setAttribute("aria-label", "Toggle navigation");
        const collapseIcon = document.createElement("span");
        collapseIcon.classList.add("navbar-toggler-icon");
        collapseButton.appendChild(collapseIcon);
        this.baseHTMLElement.appendChild(collapseButton);

        // Links to other pages
        // TODO: update main component
        const navLinksDiv = document.createElement("div");
        navLinksDiv.classList.add("collapse", "navbar-collapse");
        navLinksDiv.id = "navbarNav";
        const navLinksUl = document.createElement("ul");
        navLinksUl.classList.add("navbar-nav");
        navLinksUl.id = "navbarContainer";

        // Create navlinks components
        const navbarComponent = new Component({ parent: navLinksUl });
        const navbarLink = new NavLink("Graphs", pages.graph, { active: window.location.pathname == pages.graph })
        const navbarLink2 = new NavLink("Env", pages.env, { active: window.location.pathname == pages.env })
        const navbarLink3 = new NavLink("Log", pages.log, { active: window.location.pathname == pages.log })
        navbarComponent.appendChildren(navbarLink, navbarLink2, navbarLink3);
        navbarComponent.draw()
        navLinksDiv.appendChild(navLinksUl);
        this.baseHTMLElement.appendChild(navLinksDiv);

        // Create interval selector
        const dateTimeForm = document.createElement("form");
        dateTimeForm.classList.add("form-inline", "px-1")
        const datetimeFormGroup = document.createElement("div");
        datetimeFormGroup.classList.add("form-group");
        const intervalSelect = document.createElement("select");
        intervalSelect.id = "dateRangeSelector";
        intervalSelect.classList.add("custom-select", "mr-2");
        const interval_1d = document.createElement("option");
        interval_1d.value = "1d";
        interval_1d.innerText = "1 jour";
        const interval_2h = document.createElement("option");
        interval_2h.value = "2h";
        interval_2h.innerText = "2 heures";
        intervalSelect.appendChild(interval_1d);
        intervalSelect.appendChild(interval_2h);
        datetimeFormGroup.appendChild(intervalSelect);

        // Create datetime inputs
        const dateTimeInputGroup = document.createElement("div");
        dateTimeInputGroup.classList.add("input-group");
        const calendarWrapper = document.createElement("div");
        calendarWrapper.classList.add("input-group-prepend");
        const calendar = document.createElement("div");
        calendar.classList.add("input-group-text");
        const calendarIcon = document.createElement("i");
        calendarIcon.classList.add("fa", "fa-calendar-alt");
        calendar.appendChild(calendarIcon);
        calendarWrapper.appendChild(calendar);
        dateTimeInputGroup.appendChild(calendarWrapper);

        const deWrapper = document.createElement("div");
        deWrapper.classList.add("input-group-append");
        const de = document.createElement("div");
        de.classList.add("input-group-text");
        const deText = document.createElement("strong");
        deText.innerText = "De";
        de.appendChild(deText);
        deWrapper.appendChild(de);
        dateTimeInputGroup.appendChild(deWrapper);

        const fromInput = document.createElement("input");
        fromInput.type = "text";
        fromInput.id = "datetimepicker1";
        fromInput.classList.add("form-control", "datetimepicker-input");
        fromInput.dataset.target = "#datetimepicker1";
        fromInput.dataset.toggle = "datetimepicker";
        dateTimeInputGroup.appendChild(fromInput);

        const aWrapper = document.createElement("div");
        aWrapper.classList.add("input-group-append");
        const a = document.createElement("div");
        a.classList.add("input-group-text");
        const aText = document.createElement("strong");
        aText.innerText = "à";
        aText.style.textTransform = "uppercase"
        a.appendChild(aText);
        aWrapper.appendChild(a);
        dateTimeInputGroup.appendChild(aWrapper);

        const toInput = document.createElement("input");
        toInput.type = "text";
        toInput.id = "datetimepicker2";
        toInput.classList.add("form-control", "datetimepicker-input");
        toInput.disabled = "disabled";
        toInput.style.cursor = "not-allowed";
        toInput.style.color = "#888";
        toInput.dataset.target = "#datetimepicker2";
        toInput.dataset.toggle = "datetimepicker";
        dateTimeInputGroup.appendChild(toInput);

        datetimeFormGroup.appendChild(dateTimeInputGroup);
        dateTimeForm.appendChild(datetimeFormGroup);
        this.baseHTMLElement.appendChild(dateTimeForm);


    }
}

export default NavBarComponent