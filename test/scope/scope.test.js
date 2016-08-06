/**
 * author      : qeesung
 * email       : 1245712564@qq.com
 * filename    : scope.test.js
 * create time : Sat Aug  6 13:49:26 2016
 * description : scope jasmine test file
 */


describe("Scope", function () {
    it("can be constructed and used as an object", function () {
        var scope = new Scope();
        scope.testProperty = 1;
        expect(scope.testProperty).toBe(1);
    });

    describe("digest", function () {
        var scope ;
        beforeEach(function () {
            scope = new Scope();
        });

        it("calls the listener function of a watch on first $ digest", function () {
            var watchFn = function () {return "test";};
            var listenerFn = jasmine.createSpy();
            scope.$watch(watchFn, listenerFn);

            scope.$digest();

            expect(listenerFn).toHaveBeenCalled();
        });
    });
});
