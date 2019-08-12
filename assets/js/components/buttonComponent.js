import Component from "./baseComponent.js";


class Button extends Component {

    /**
     *Creates an instance of Button.
     
     * @extends {Component}
     * @param {string} text
     * @param {*} options
     * @memberof Components
     */
    constructor(text, options) {
        super(options);
        this.text = text;
        this.type = (options && options.type) != undefined ? options.type : Button.Types().DEFAULT;
        this.init()
    }

    /**
     *
     * @static
     * @returns {Object} 
     * @memberof Components
     */
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

export default Button;