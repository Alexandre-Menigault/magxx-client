import DateTimeValidator from "../validators/dateTimeValidator.js";

// import assert from "assert"

describe("Date time", function () {
    describe('Valid date time', () => {
        it("Should return true when data is a valid date", function () {
            chai.expect(DateTimeValidator.DateTime("16/09/2019", "DD/MM/YYYY")).to.equal(true)
        })
        it("Should return true when data is a valid date", function () {
            chai.expect(DateTimeValidator.DateTime("09/16/2019", "MM/DD/YYYY")).to.equal(true)
        })
        it("Should return true when data is a valid time", function () {
            chai.expect(DateTimeValidator.DateTime("13.09.25", "HH.mm.ss")).to.equal(true)
        })
    });
    describe('Invalid date time', () => {
        it("Should return false when month is not a valid month", function () {
            chai.expect(DateTimeValidator.DateTime("16/13/2019", "DD/MM/YYYY")).to.equal(false)
        })
        it("Should return false when day is not a valid month", function () {
            chai.expect(DateTimeValidator.DateTime("32/12/2019", "DD/MM/YYYY")).to.equal(false)
        })
        it("Should return false when hour is not a valid hour", function () {
            chai.expect(DateTimeValidator.DateTime("25.00.00", "HH.mm.ss")).to.equal(false)
        })
        it("Should return false when minutes is not a valid minutes", function () {
            chai.expect(DateTimeValidator.DateTime("23.70.00", "HH.mm.ss")).to.equal(false)
        })
        it("Should return false when seconds is not a valid seconds", function () {
            chai.expect(DateTimeValidator.DateTime("23.00.70", "HH.mm.ss")).to.equal(false)
        })
        it("Should return false when format is not a valid format", function () {
            chai.expect(DateTimeValidator.DateTime("31/12/2019", "YYYY/MM/DD")).to.equal(false)
        })

    });
})