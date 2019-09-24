class DateTimeValidator {
    static get TIME_FORMAT_COLUMN() { return "H:mm:ss" }
    static get TIME_FORMAT_POINT() { return "H.mm.ss" }
    static get DATE_FORMAT() { return "DD/MM/YYYY" }
    /**
     * Date time validator using momentjs
     * @static
     * @param {string} value
     * @param {string} [format="DD/MM/YYYY hh:mm:ss"]
     * @returns {boolean}
     * @memberof DateTimeValidator
     */
    static DateTime(value, format = "DD/MM/YYYY hh:mm:ss") {
        const datetime = moment(value, format, true);
        return datetime.isValid()
    }

}

export default DateTimeValidator;