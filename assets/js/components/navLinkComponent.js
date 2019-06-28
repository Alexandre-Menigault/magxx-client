import Component from "./baseComponent.js";

export default class NavLinkComponent extends Component {

    constructor(text, link, options) {
        super(options);
        this.text = text;
        this.link = link;
        this.init();
    }

    init() {
        this.baseHTMLElement = document.createElement("li");
        this.baseHTMLElement.classList.add("nav-link");
        const a = document.createElement("a");
        a.href = this.link;
        a.classList.add("nav-link");
        a.innerText = this.text
        if (this.options.disabled) {
            a.setAttribute("tabindex", "-1");
            a.setAttribute("aria-disabled", "true");
            a.classList.add("disabled");
        }
        if (this.options.active) this.baseHTMLElement.classList.add("active")
        this.baseHTMLElement.appendChild(a);
    }
}