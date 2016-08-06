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

        it("call the listenfn when the watched value changed", function () {
            scope.someValue = 'a';
            scope.counter = 0;

            function watchFn(scope, property) {
                property = 'someValue';
                return scope[property];
            }

            function listenerFn(newValue, oldValue, scope) {
                scope.counter++;
            }

            scope.$watch(watchFn, listenerFn);

            // test the count
            expect(scope.counter).toBe(0);

            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.someValue = 'b';
            expect(scope.counter).toBe(1);

            scope.$digest();
            expect(scope.counter).toBe(2);
        });

        it('calls listener when watch calue is first undefined', function () {
            scope.counter = 0;

            function watchFn(scope, property) {
                property = 'someValue';
                return scope[property];
            }

            function listenerFn(newValue, oldValue, scope) {
                scope.counter++;
            }

            scope.$watch(watchFn, listenerFn);
            scope.$digest();
            expect(scope.counter).toBe(1);
        });

        it("calls listener with new value as old value the first time", function () {
            scope.someValue = 123;
            var oldValueGiven =0;

            function watchFn(scope, property) {
                property = 'someValue';
                return scope[property];
            }

            function listenerFn(newValue, oldValue, scope) {
                oldValueGiven = oldValue;
            }

            scope.$watch(watchFn, listenerFn);

            scope.$digest();
            expect(oldValueGiven).toBe(123);
        });
    });
});
