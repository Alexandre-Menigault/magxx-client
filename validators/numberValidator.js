class NumberValidator {
    /**
     * 
     * @param {string} data The decimal number from a form
     * @param {number=} [precision=0] The precision to get
     * @param {boolean=} [negative=false] Is negative allowed
     * 
     * @returns {boolean} Is the data a decimal number
     */
    static Decimal(data, precision = 0, negative = false) {
        if (data == "") return false;
        //Allowed: 1, 10.8, 10.89, .89, 0.89, 1000, -1.25, -0.200
        //Not Allowed: 20. , 50.89.9, 12.999, .
        // Default regex = /^[-]?[0-9]{0,}(\\.\\,[0-9]{0,2}){0,1}$/
        const negativeString = negative == true ? "[-]?" : "";
        const precisionString = precision > 1 ? `{1,${precision}}` : '{1}'

        const regex = new RegExp(`^${negativeString}[0-9]{0,}([\\.\\,][0-9]${precisionString}){0,1}$`, "");
        return regex.test(data);

    }

}

export default NumberValidator;