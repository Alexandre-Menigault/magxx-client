/**
 * @namespace Components
 */

/**
 * @typedef ComponentType
 * @property {ComponentType[]} children
 * @property {Object} options
 * @property {HTMLElement} baseHTMLElement
 * @memberof Components
 */


class Component {
    /**
     *Creates an instance of Component.
     * @param {Object} options
     * @property {Component[]} children
     * @property {Object} options
     * @property {HTMLElement} baseHTMLElement
     * @memberof Components
     */
    constructor(options) {
        this.children = [];
        this.options = options != undefined ? options : {}
        if (options.parent !== undefined) {
            this.baseHTMLElement = options.parent;
        } else {
            this.baseHTMLElement = document.createElement("div")
            this.baseHTMLElement.classList.add("container-fluid")
        }
    }


    /**
     * Initialize component
     * 
     */
    init() {
    }

    /**
     * @callback clickCallback
     * @param {MouseEvent} e 
     * @memberof Components
     */

    /**
     * 
     * @param {clickCallback} clickHandler 
     */

    onclick(clickHandler) {
        this.baseHTMLElement.onclick = clickHandler;
    }

    /**
     * Appends a list of children {@link Component|Components}
     * @param {...Component} child
     */
    appendChildren(...children) {
        this.children.push(...children);
    }


    /**
     * Displays the {@link Component} and its children
     *
     */
    draw() {
        for (let child of this.children) {
            child.draw();
            this.baseHTMLElement.appendChild(child.baseHTMLElement);
        }
    }
}

export default Component;