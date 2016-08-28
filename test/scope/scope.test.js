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

        it("watch function will be invoked whenever the $digest", function () {
            var watchFn = jasmine.createSpy().and.returnValue("somevalue");
            scope.$watch(watchFn/** omit the listener function here */);

            scope.$digest();

            expect(watchFn).toHaveBeenCalled();
        });

        it("triggers chained watchers in the same digest", function () {
            scope.name = "abc";
            scope.testValue = "";// use this value to check if upperName is chenged

            // watch the upperName property
            scope.$watch(function (scope) {
                return scope.upperName;
            },function (newValue, oldValue, scope) {
                if(newValue) // first time the new value is undefined
                    scope.testValue = newValue.substring(0,1)+"-";
            });

            // watch the name property
            scope.$watch(function (scope) {
                return scope.name;
            },function (newValue, oldValue, scope) {
                // here change the nameUppper property
                scope.upperName = newValue.toUpperCase();
            });


            scope.$digest();
            expect(scope.testValue).toBe('A-');

            scope.name = "def";
            scope.$digest();
            expect(scope.testValue).toBe('D-');

        });

        it("given up on the watchers after 10 iterations", function () {
            scope.counterA = 0;
            scope.counterB = 0;

            scope.$watch(function (scope) {
                return scope.counterA;
            },function (newValue, oldValue, scope) {
                scope.counterB++;
            });

            scope.$watch(function (scope) {
                return scope.counterB;
            },function (newValue, oldValue, scope) {
                scope.counterA++;
            });

            expect((function () {
                scope.$digest(); // here will throw a exception
            })).toThrow();

        });

        it("ends the digest when the last watch is clean", function () {
            scope.array = _.range(100);
            var watchExecutions = 0;

            _.times(100, function (i) {
                scope.$watch(
                    function (scope) {
                        watchExecutions++;
                        return scope.array[i];
                    },
                    function (newValue, oldValue, scope) {

                    }
                );
            });

            scope.$digest();
            expect(watchExecutions).toBe(200);

            scope.array[0] = 420;
            scope.$digest();
            expect(watchExecutions).toBe(301);
        });

        it("compares base on value if enabled", function () {
            scope.baseArray = [1,2];
            var changeCounter = 0 ;

            scope.$watch(function (scope) {
                return scope.baseArray;
            },function (newValue, oldValue, scope) {
                changeCounter++;
            },true/** true enable the base value compare */);

            scope.$digest();
            expect(changeCounter).toBe(1);

            scope.baseArray.push(3); // change the value , not change the reference
            scope.$digest();
            expect(changeCounter).toBe(2);
        });

        it("correctly handles NaNs", function () {
            scope.number = 0/0;
            scope.counter = 0;

            scope.$watch(function (scope) {
                return scope.number;
            },function (newValue, oldValue, scope) {
                scope.counter++;
            });

            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$digest();
            expect(scope.counter).toBe(1);// NaN is not equal Nan itseft forever  need to fix this issue
        });

        it("executes $eval'ed function and returns result", function () {
            scope.aValue = 1;

            var result = scope.$eval(function (scope) {
                return scope.aValue;
            });

            expect(result).toBe(1);
        });

        it('executes $eval.ed function that with args and returns result', function () {
            scope.aValue = 1;

            var result = scope.$eval(function (scope, arg) {
                return scope.aValue + arg;
            },2);

            expect(result).toBe(3);
        });

        it("executes $apply'ed function , and the scope will notice the changed value",function () {
            scope.aValue = 1;
            scope.counter = 0;

            scope.$watch(function (scope) {
                return scope.aValue;
            },function (newValue, oldValue, scope) {
                scope.counter ++;
            });

            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$apply(function (scope) {
                scope.aValue = 2;
            });
            expect(scope.counter).toBe(2);// anguarl will notice the change
        });
    });
});
