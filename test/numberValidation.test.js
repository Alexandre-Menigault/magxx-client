import NumberValidator from "../validators/numberValidator.js";

// import assert from "assert";

describe("Decimal", function () {
    describe('Valid decimal', () => {
        it("Should return true when data is a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("1")).to.equal(true)
        })
        it("Should return true when data is a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("10.8", 1)).to.equal(true)
        })
        it("Should return true when data is a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("10.89", 2)).to.equal(true)
        })
        it("Should return true when data is a valid decimal", function () {
            chai.expect(NumberValidator.Decimal(".89", 2)).to.equal(true)
        })
        it("Should return true when data is a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("1000", 0)).to.equal(true)
        })
        it("Should return true when data is a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("1000", 4)).to.equal(true)
        })
        it("Should return true when data is a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("-5.22", 4, true)).to.equal(true)
        })
        it("Should return true when data is a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("-5,22", 4, true)).to.equal(true)
        })
        it("Should return true when data is a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("0.999", 5)).to.equal(true)
        })
        it("Should return true when data is a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("0.136776", 10)).to.equal(true)
        })
    });
    describe('Invalid decimal', () => {
        it("Should return false when data is not a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("10.89", 1)).to.equal(false)
        })
        it("Should return false when data is not a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("20.", 4)).to.equal(false)
        })
        it("Should return false when data is not a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("-50.89.9", 100, false)).to.equal(false)
        })
        it("Should return false when data is not a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("12.999", 0)).to.equal(false)
        })
        it("Should return false when data is not a valid decimal", function () {
            chai.expect(NumberValidator.Decimal("12d999", 0)).to.equal(false)
        })
    });
})