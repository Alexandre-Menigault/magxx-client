/**
 * @typedef ComponentType
 * @property {ComponentType[]} children
 * @property {Object} options
 * @property {HTMLElement} baseHTMLElement
 */

export default class Component {
    constructor(options) {
        this.children = [];
        this.options = options != undefined ? options : {}
        this.baseHTMLElement = document.createElement("div")
        this.baseHTMLElement.classList.add("container-fluid")
    }

    init() {
    }

    onclick(clickHandler) {
        this.baseHTMLElement.onclick = clickHandler;
        return clickHandler
    }

    /**
     *
     *
     * @param {ComponentType|ComponentType[]} child
     * @memberof Component
     */
    appendChildren(...children) {
        this.children.push(...children);
    }

    draw(parent) {
        // parent.innerHTML = "";
        for (let child of this.children) this.baseHTMLElement.appendChild(child.baseHTMLElement);
        parent.appendChild(this.baseHTMLElement);
    }
}