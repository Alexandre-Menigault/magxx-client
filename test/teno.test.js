// const Teno = require("./teno")
// const assert = require('assert');

import Teno from "../assets/js/teno.js"

describe('Teno must pass', () => {
    it('should return 2000-01-01T00:00:00Z when teno < 0', () => {
        const UTC = Teno.toYYYYMMDDHHMMSS(-1);
        chai.expect(UTC).to.deep.equal(new Teno(0, { hh: 0, mm: 0, ss: 0, yyyy: 2000, mmmm: 1, dddd: 1 }))
    })
    it('should return 2000-01-01T00:00:00Z when teno == 0', () => {
        const UTC = Teno.toYYYYMMDDHHMMSS(0);
        chai.expect(UTC).to.deep.equal(new Teno(0, { hh: 0, mm: 0, ss: 0, yyyy: 2000, mmmm: 1, dddd: 1 }))
    })
    it('should return 2005-12-31T23:59:60Z when teno == 189388800', () => {
        const UTC = Teno.toYYYYMMDDHHMMSS(189388800);
        chai.expect(UTC).to.deep.equal(new Teno(189388800, { hh: 23, mm: 59, ss: 60, yyyy: 2005, mmmm: 12, dddd: 31 }))
    })

    it('should return 2008-12-31T23:59:60Z when teno == 284083201', () => {
        const UTC = Teno.toYYYYMMDDHHMMSS(284083201);
        chai.expect(UTC).to.deep.equal(new Teno(284083201, { hh: 23, mm: 59, ss: 60, yyyy: 2008, mmmm: 12, dddd: 31 }))
    })

    it('should return 2012-06-301T23:59:60Z when teno == 394416002', () => {
        const UTC = Teno.toYYYYMMDDHHMMSS(394416002);
        chai.expect(UTC).to.deep.equal(new Teno(394416002, { hh: 23, mm: 59, ss: 60, yyyy: 2012, mmmm: 6, dddd: 30 }))
    })
    it('should return 2015-06-301T23:59:60Z when teno == 489024003', () => {
        const UTC = Teno.toYYYYMMDDHHMMSS(489024003);
        chai.expect(UTC).to.deep.equal(new Teno(489024003, { hh: 23, mm: 59, ss: 60, yyyy: 2015, mmmm: 6, dddd: 30 }))
    })

    it('should return 2016-12-31T23:59:60Z when teno == 536544004', () => {
        const UTC = Teno.toYYYYMMDDHHMMSS(536544004);
        chai.expect(UTC).to.deep.equal(new Teno(536544004, { hh: 23, mm: 59, ss: 60, yyyy: 2016, mmmm: 12, dddd: 31 }))
    })

    it('should return 2019-04-06T23:59:42Z when teno == 607910387', () => {
        const UTC = Teno.toYYYYMMDDHHMMSS(607910387);
        chai.expect(UTC).to.deep.equal(new Teno(607910387, { hh: 23, mm: 59, ss: 42, yyyy: 2019, mmmm: 4, dddd: 6 }))
    })
    it('should return 2019-08-10T22:31:53Z when teno == 618791518', () => {
        const UTC = Teno.toYYYYMMDDHHMMSS(618791518);
        chai.expect(UTC).to.deep.equal(new Teno(618791518, { hh: 22, mm: 31, ss: 53, yyyy: 2019, mmmm: 8, dddd: 10 }))
    })


    it('should return 2000-01-01T00:00:00Z when teno == 0', () => {
        const UTC = Teno.fromYYYYMMDDHHMMSS({ hh: 0, mm: 0, ss: 0, yyyy: 2000, mmmm: 1, dddd: 1 });
        chai.expect(UTC).to.deep.equal(new Teno(0, { hh: 0, mm: 0, ss: 0, yyyy: 2000, mmmm: 1, dddd: 1 }))
    })
    it('should return 2019-04-06T23:59:42Z when teno == 607910387', () => {
        const UTC = Teno.fromYYYYMMDDHHMMSS({ hh: 23, mm: 59, ss: 42, yyyy: 2019, mmmm: 4, dddd: 6 });
        chai.expect(UTC).to.deep.equal(new Teno(607910387, { hh: 23, mm: 59, ss: 42, yyyy: 2019, mmmm: 4, dddd: 6 }))
    })
    it('should return 2019-08-10T22:31:53Z when teno == 618791518', () => {
        const UTC = Teno.fromYYYYMMDDHHMMSS({ hh: 22, mm: 31, ss: 53, yyyy: 2019, mmmm: 8, dddd: 10 });
        chai.expect(UTC).to.deep.equal(new Teno(618791518, { hh: 22, mm: 31, ss: 53, yyyy: 2019, mmmm: 8, dddd: 10 }))
    })

    it('should return 2008-12-31T23:59:60Z when teno == 284083201', () => {
        const UTC = Teno.fromYYYYMMDDHHMMSS({ hh: 23, mm: 59, ss: 60, yyyy: 2008, mmmm: 12, dddd: 31 });
        chai.expect(UTC).to.deep.equal(new Teno(284083201, { hh: 23, mm: 59, ss: 60, yyyy: 2008, mmmm: 12, dddd: 31 }))
    })

    it('should return 2019-08-12T02:07:00Z when timestamp == 1566086400', () => {
        const UTC = Teno.fromTimestamp(1566086400 * 1000);
        chai.expect(UTC).to.deep.equal(new Teno(619408805, { hh: 2, mm: 0, ss: 0, yyyy: 2019, mmmm: 8, dddd: 18 }))
    })
});