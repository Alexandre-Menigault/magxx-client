import Component from "./baseComponent.js";


export default class Button extends Component {
    constructor(text, options) {
        super(options);
        this.text = text;
        this.type = (options && options.type) != undefined ? options.type : Button.Types().DEFAULT;
        this.init()
    }

    static Types() {
        return {
            WARNING: "btn-warning",
            DANGER: "btn-danger",
            DEFAULT: "btn-info",
        };
    }

    init() {
        this.baseHTMLElement = document.createElement("button");
        if (this.options.id != undefined) this.baseHTMLElement.id = options.id;
        this.baseHTMLElement.setAttribute("type", "button");
        this.baseHTMLElement.classList.add("btn", this.type)

        this.baseHTMLElement.innerText = this.text;
    }
}
/**
 * @type {import('./baseComponent').ComponentType}
 */