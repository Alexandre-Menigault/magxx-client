// const Teno = require("./teno")
// const assert = require('assert');

import Teno from "../assets/js/teno.js"
import TenoFormatter from "../assets/js/tenoFormtter.js"

describe('Teno formater', () => {
    it('should return 2000-01-01 00:00:00 when teno < 0', () => {
        const UTC = Teno.toYYYYMMDDHHMMSS(-1);
        const stringResult = TenoFormatter.format(UTC, "%Y-%m-%D %H:%M:%S");
        const should = "2000-01-01 00:00:00"
        chai.expect(stringResult).to.equal(should);
    })

    it('should return 06/04/2019 23:59:42 when teno == 607910387', () => {
        const UTC = Teno.toYYYYMMDDHHMMSS(607910387);
        const stringResult = TenoFormatter.format(UTC, "%D/%m/%Y %H:%M:%S");
        const should = "06/04/2019 23:59:42"
        chai.expect(stringResult).to.equal(should);
    })
});