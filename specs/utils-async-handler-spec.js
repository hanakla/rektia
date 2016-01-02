const handleAsync = require("../lib/utils/handle-async");;

const testYieldPromise = function* () {
    const str1 = yield (new Promise((resolve, reject) => {
        setTimeout(() => { resolve("Correctly "); }, 1);
    }));

    const str2 = yield (new Promise((resolve, reject) => {
        setTimeout(() => { resolve("handled!"); }, 1);
    }));

    return str1 + str2;
};

const testYieldPrimitive = function* () {
    const val = yield "gcus";
    return val;
};

const testPromise = function () {
    return new Promise((resolve, reject) => {
        setTimeout((() => resolve("knirmzik")), 100);
    });
}

const testReturnsPrimitive = function () {
    return "yryr";
};

describe("utils/async-handler", () => {
    it("Correctly handled yield Promise?", next => {
        handleAsync(testYieldPromise()).then(val => {
            val.should.equal("Correctly handled!");
            next();
        })
        .catch(e => next(e));
    });


    it("Correctly handled yield Primitive?", next => {
        handleAsync(testYieldPrimitive()).then(val => {
            val.should.equal("gcus");
            next();
        })
        .catch(e => next(e));
    });


    it("Correctly handled Promise?", next => {
        handleAsync(testPromise()).then(val => {
            val.should.equal("knirmzik");
            next();
        })
        .catch(e => next(e));
    });


    it("Correctly handled Primitive returned values", next => {
        handleAsync(testReturnsPrimitive()).then(val => {
            val.should.equal("yryr");
            next();
        })
        .catch(e => next(e));
    });
});
