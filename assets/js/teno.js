
/**
 * @typedef DateFormat
 * 
 * @property {number} teno
 * @property {number} yyyy - yyyy >= 2000
 * @property {number} mmmm - 1 <= mmmm <= 12
 * @property {number} dddd - 1 <= dddd <= 31
 * @property {number} hh - 0 <= hh <= 24
 * @property {number} mm - 0 <= mm <= 59
 * @property {number} ss - 0 <= ss <= 60
 * 
 * @memberof Teno
 */
class Teno {

    /**
     * The list of leap seconds starting from January 1st 2000
     *
     * @returns {{leap: number, number: number, count: number}[]} Leaps
     * 
     * @readonly
     * @static
     * @memberof Teno
     */
    static get LEAP_SECONDS() {
        return [
            { leap: 536544004, number: 5, count: 1 },
            { leap: 489024003, number: 4, count: 1 },
            { leap: 394416002, number: 3, count: 1 },
            { leap: 284083201, number: 2, count: 1 },
            { leap: 189388800, number: 1, count: 1 },
            { leap: -1, number: 0, count: 0 },
        ];
    }


    /**
     * The list of all Febuary 29 starting from January 1 2000
     * 
     * @returns {{start: number, end: number}[]}
     * 
     * @readonly
     * @static
     * @memberof Teno
     */
    static get FEBUARY_29s() {
        return [
            { start: 5097600, end: 5097600 + 86400 },
            { start: 13132800, end: 13132800 + 86400 },
            { start: 254558400, end: 254558400 + 86400 },
            { start: 383788800, end: 383788800 + 86400 },
            { start: 510019200, end: 510019200 + 86400 },
            { start: 636249600, end: 636249600 + 86400 },
        ];
    }

    static _get29FebOfYear(yyyy) {
        const startYearTeno = Teno.fromYYYYMMDDHHMMSS({ yyyy, mmmm: 1, dddd: 1, hh: 0, mm: 0, ss: 0 });
        const endYearTeno = Teno.fromYYYYMMDDHHMMSS({ yyyy, mmmm: 12, dddd: 31, hh: 23, mm: 59, ss: 59 });
        for (let feb29 of Teno.FEBUARY_29s) {
            if (feb29.start > startYearTeno.teno && feb29.end < endYearTeno.teno) {
                return feb29;
            }
        }
    }

    /**
     * Get the modulus of a number
     *
     * @static
     * @param {number} n
     * @param {number} m
     * @returns {number}
     * @memberof Teno
     */
    static mod(n, m) {
        return ((n % m) + m) % m;
    }

    /**
     * Is the specified year a leap year
     * @param {number} year 
     * @returns {boolean}
     */
    static _IS_BISEXTILE_YEAR(year) {
        return year % 4 === 0;
    }


    /**
     * Return an array of the number of days in month. Including leap years
     * 
     * @param {number} year
     * @return {number[]}
     */
    static DAYS_IN_MONTH(year) {
        return [
            31, // Jan
            Teno._IS_BISEXTILE_YEAR(year) ? 29 : 28, // Feb
            31, // Mar
            30, // Apr
            31, // Mai
            30, // Jun
            31, // Jui
            31, // Aug
            30, // Sep
            31, // Oct
            30, // Nov
            31, // Dec
        ]
    }


    /**
     * Return the month number and the days in month of the specified year until the specified days of year
     * 
     * @param {number} year 
     * @param {number} daysOfYear The count of days in year
     * @param {number} teno The count of days in year
     * @return {{mmmm: number, dddd: number}}
     */
    static _getMonthNumberAndDayOfMonth(year, daysOfYear, teno) {
        let remainingDays = daysOfYear;
        let monthCounter = 1;
        const daysInMonthYear = Teno.DAYS_IN_MONTH(year);
        for (let daysInMonth of daysInMonthYear) {
            if (remainingDays > daysInMonth) {
                monthCounter++;
                remainingDays -= daysInMonth;
            } else {
                break;
            }
        }

        if (Teno._IS_BISEXTILE_YEAR(year)) {
            const feb29 = Teno._get29FebOfYear(year)
            if (teno >= feb29.end) {
                remainingDays += 1
                if (remainingDays >= daysInMonthYear[monthCounter - 1]) {
                    remainingDays -= daysInMonthYear[monthCounter - 1];
                    monthCounter++;
                }
            } else if (teno < feb29.start) {
                if (remainingDays + 1 > daysInMonthYear[monthCounter - 1]) {
                    remainingDays -= daysInMonthYear[monthCounter - 1];
                    monthCounter++;
                }
            }
        }

        return { mmmm: monthCounter, dddd: remainingDays + 1 };
    }

    /**
     * Count the number of days until the specified date. Includes the Febuary 29 if applicable
     *
     * @static
     * @param {number} dddd
     * @param {number} month
     * @param {number} year
     * @returns {number}
     * @memberof Teno
     */
    static _countDaysUntil(dddd, month, year) {
        let total = 0;
        for (let j = 2000; j <= year; j++) {
            const dim = Teno.DAYS_IN_MONTH(j);
            for (let i = 0; i <= (j == year ? month - 2 : 11); i++) {
                total += dim[i];
            }
        }
        return total + dddd - 1;
    }

    /**
     * Get the number of leap seconds at the specified Teno time
     *
     * @static
     * @param {number} teno
     * @returns {number}
     * @memberof Teno
     */
    static _getNumberOfLeaps(teno) {
        for (const leap of Teno.LEAP_SECONDS) {
            if (leap.leap <= teno) return leap.number;
        }
        return 0;
    }

    /**
     * Get the number of Febuary 29 from January 1 2000 until teno time
     *
     * @static
     * @param {number} teno
     * @returns {number}
     * @memberof Teno
     */
    static _getNumberOfBisextile(teno) {
        let count = 0;
        for (const bisextile of Teno.FEBUARY_29s) {
            if (teno >= bisextile.end) count++;
        }
        return count;
    }

    /**
     * Is the specified Teno time is a leap second
     *
     * @static
     * @param {number} teno
     * @returns {boolean}
     * @memberof Teno
     */
    static _isLeap(teno) {
        for (const leap of Teno.LEAP_SECONDS) {
            if (leap.leap === teno) return true;
        }
        return false;
    }

    /**
     * Count the number of leap seconds until the specified Teno time
     *
     * @static
     * @param {number} teno
     * @returns {number}
     * @memberof Teno
     */
    static _leapCount(teno) {
        for (const leap of Teno.LEAP_SECONDS) {
            if (leap.leap === teno) return leap.count;
        }
        return 0;
    }

    _getZeros(len) {
        let res = "";
        for (let i = 0; i < len; i++) {
            res = res + "0";
        }
        return res
    }

    fixedTeno() {
        let tenoLen = `${this.teno}`.length;
        const zerosToAdd = 10 - tenoLen;
        return this._getZeros(zerosToAdd) + this.teno
    }

    /**
     * Converts the speficied Teno time to YYYY MM DD HH MM SS
     *
     * @static
     * @param {number} teno
     * @returns {Teno}
     * @memberof Teno
     */
    static toYYYYMMDDHHMMSS(teno) {
        if (teno < 0) return new Teno(0, { hh: 0, mm: 0, ss: 0, yyyy: 2000, mmmm: 1, dddd: 1 });

        // const nld = Teno._getNumberOfLeaps(teno);
        const nld = 0;
        const s = Teno.mod(teno - nld, 86400);

        //Time 
        let hh = Math.floor(s / 3600);
        let mm = Math.floor((s - 3600 * hh) / 60);
        let ss = s - 60 * mm - 3600 * hh;

        // Date
        const nd = Math.floor((teno - nld) / 86400);
        const nb = Teno._getNumberOfBisextile(teno);
        const ndb = nd - nb;

        let doyb = Teno.mod(ndb, 365);
        let yyyy = 2000 + Math.floor((ndb - doyb) / 365);
        let { mmmm, dddd } = Teno._getMonthNumberAndDayOfMonth(yyyy, doyb, teno)

        // if (Teno._IS_BISEXTILE_YEAR(yyyy) && mmmm >= 3) dddd--

        if (Teno._isLeap(teno)) {
            const leapCount = Teno._leapCount(teno)
            if (leapCount === 1) ss = 60;
            else ss = 59;
        }

        return new Teno(teno, { hh, mm, ss, yyyy, mmmm, dddd });

    }

    static fromTimestamp(timestamp) {
        const date = new Date(timestamp);
        return Teno.fromYYYYMMDDHHMMSS({
            yyyy: date.getFullYear(),
            mmmm: date.getMonth() + 1,
            dddd: date.getDate(),
            hh: date.getHours(),
            mm: date.getMinutes(),
            ss: date.getSeconds()
        });
    }

    /**
     * Converts the specified UTC like date to Teno time
     *
     * @static
     * @param {{yyyy: number, mmmm:  number, dddd: number, hh: number, mm: number, ss: number}} yyyymmddhhmmss
     * @returns {Teno}
     * @memberof Teno
     */
    static fromYYYYMMDDHHMMSS(yyyymmddhhmmss) {
        const { yyyy, mmmm, dddd, hh, mm, ss } = yyyymmddhhmmss;
        if ((yyyy - 2000) < 0) return new Teno(0, { hh: 0, mm: 0, ss: 0, yyyy: 2000, mmmm: 1, dddd: 1 });
        let total = ss;
        total += mm * 60;
        total += hh * 3600;
        total += Teno._countDaysUntil(dddd, mmmm, yyyy) * 86400;
        //total += Teno._getNumberOfLeaps(total);
        return new Teno(total, yyyymmddhhmmss);
    }

    /**
     *Creates an instance of Teno.
     * @param {number} teno
     * @param {{yyyy: number, mmmm:  number, dddd: number, hh: number, mm: number, ss: number}} data
     * @memberof Teno
     */
    constructor(teno, data) {
        this.teno = teno;
        this.hh = data.hh;
        this.mm = data.mm;
        this.ss = data.ss;
        this.dddd = data.dddd;
        this.mmmm = data.mmmm;
        this.yyyy = data.yyyy;
    }

    /**
     * Check if two Teno are equals
     *
     * @param {Teno} other
     * @returns {boolean}
     * @memberof Teno
     */
    equals(other) {
        return this.yyyy == other.yyyy &&
            this.mmmm == other.mmmm &&
            this.dddd == other.dddd &&
            this.hh == other.hh &&
            this.mm == other.mm &&
            this.ss == other.ss &&
            this.teno == other.teno
    }
}



// const t = Teno.fromYYYYMMDDHHMMSS({ hh: 23, mm: 59, ss: 59, yyyy: 2005, mmmm: 12, dddd: 31 })
// const u = Teno.toYYYYMMDDHHMMSS(t.teno);

// // 189388800
// console.log(u);

export default Teno;