import Teno from "./teno.js";

class TenoFormatter {

    /**
     *
     *
     * @readonly
     * @static
     * @returns {string[]}
     * @memberof TenoFormatter
     */
    static get MONTHS() {
        return [
            "January",
            "Febuary",
            "March",
            "April",
            "Mai",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ]
    }

    /**
     * Format the Teno according to the format
     *
     * @static
     * @param {Teno} teno
     * @param {string} format
     * @returns {(string|boolean)}
     * @memberof TenoFormatter
     */
    static format(teno, format) {
        if (!teno instanceof Teno || !format instanceof String) return false;

        format = format.replace("%Y", teno.yyyy); // Year
        format = format.replace("%m", TenoFormatter.fixTime(teno.mmmm)); // 2 digits months
        format = format.replace("%-m", teno.mmmm); // 1-2 digit month
        format = format.replace("%b", TenoFormatter.getShortMonth(teno.mmmm)); // Get 3 char + '.' month name 
        format = format.replace("%B", TenoFormatter.getFullMonth(teno.mmmm)); // Get full month name
        format = format.replace("%D", TenoFormatter.fixTime(teno.dddd)); // Get 2 digit date
        format = format.replace("%d", teno.dddd); // Get 1-2 digit date
        format = format.replace("%H", TenoFormatter.fixTime(teno.hh)); // Get 2 digit hour
        format = format.replace("%h", teno.hh); // Get 1-2 digit hour
        format = format.replace("%M", TenoFormatter.fixTime(teno.mm)); // Get 2 digit minutes
        format = format.replace("%-M", teno.mm); // Get 1-2 digit minutes
        format = format.replace("%S", TenoFormatter.fixTime(teno.ss)); // Get 2 digit seconds
        format = format.replace("%s", teno.ss); // Get 1-2 digit seconds

        return format;
    }


    /**
     * Return the 2 digit time
     *
     * @static
     * @param {number} time
     * @returns {string}
     * @memberof TenoFormatter
     */
    static fixTime(time) {
        if (time < 10) return "0" + time;
        return time;
    }

    /**
     * Get the 3 char month name
     *
     * @static
     * @param {number} month - The month of year ( 1-12 )
     * @returns {string}
     * @memberof TenoFormatter
     */
    static getShortMonth(month) {
        return TenoFormatter.MONTHS[month - 1].slice(0, 4)[0] + ".";
    }

    /**
     * Get the full month name
     *
     * @static
     * @param {number} month - The month of the year ( 1-12 )
     * @returns {string}
     * @memberof TenoFormatter
     */
    static getFullMonth(month) {
        return TenoFormatter.MONTHS[month - 1];
    }
}

export default TenoFormatter