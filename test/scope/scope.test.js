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

        it("execute $evalAsync'ed function later in the same cycle", function () {
            scope.aValue = [1,2,3];
            scope.asyncEvaluated = false;
            scope.asyncEvaluatedImmediately = false;

            scope.$watch(function (scope) {
                return scope.aValue;
            },function (newValue, oldValue, scope) {
                // add a new async function here
                scope.$evalAsync(function (scope) {
                    scope.asyncEvaluated = true; // this code will be executed in the same digest circle
                });

                scope.asyncEvaluatedImmediately = scope.asyncEvaluated;// change the status immediately
            });

            scope.$digest();
            expect(scope.asyncEvaluated).toBe(true);
            expect(scope.asyncEvaluatedImmediately).toBe(false);
        });

        it("executes $evalAsync'ed functions added by watch functions", function () {
            scope.aValue = [1,2,3];
            scope.asyncEvaluated = false;

            scope.$watch(function (scope) {
                if(!scope.asyncEvaluated){
                    scope.$evalAsync(function (scope) {
                        scope.asyncEvaluated = true;
                    });
                }
                return scope.aValue;
            },function (newValue, oldValue,scope) {

            });

            scope.$digest();
            expect(scope.asyncEvaluated).toBe(true);
        });

        it("executes $evalAsync'ed functions even when not dirty", function () {
            scope.aValue = [1,2,3];
            scope.asyncEvaluatedTimes = 0;

            scope.$watch(function (scope) {
                if(scope.asyncEvaluatedTimes < 2){
                    scope.$evalAsync(function (scope) {
                        // here will push more than one task in to the queue, but the dirty is clean now , so the task will not be executed
                        scope.asyncEvaluatedTimes++;
                    });
                }
                return  scope.aValue;
            }, function (newValue, oldValue, scope) {

            });

            scope.$digest();
            expect(scope.asyncEvaluatedTimes).toBe(2);
        });

        it("eventually halts $evalAsyncs added by watches", function () {
            scope.aValue = [1,2,3];

            scope.$watch(function (scope) {
                scope.$evalAsync(function (scope) {
                    // doing nothing here, just push the task
                });
                return scope.aValue;
            },function (newValue, oldValue, scope) {

            });

            expect(function () {
                scope.$digest();
            }).toThrow();
        });

        it("has a $$scope field whose value is the current digest phase", function () {
            scope.aValue = [1,2,3];
            scope.phaseInWatchFunction = null;
            scope.phaseInListenerFunction = null;
            scope.phaseInApplyFunction = null;

            scope.$watch(function (scope) {
                scope.phaseInWatchFunction = scope.$$phase;
            },function (newValue, oldValue, scope) {
                scope.phaseInListenerFunction = scope.$$phase;
            });

            scope.$apply(function (scope) {
                scope.phaseInApplyFunction = scope.$$phase;
            });

            expect(scope.phaseInWatchFunction).toBe("$digest");
            expect(scope.phaseInListenerFunction).toBe("$digest");
            expect(scope.phaseInApplyFunction).toBe("$apply");
        });

        it("schedules a digest in  $evalAsync", function (done) {
            scope.aValue = [1,2,3];
            scope.counter = 0;

            scope.$watch(function (scope) {
                return scope.aValue;
            },function (newValue, oldValue, scope) {
                scope.counter ++;
            });

            scope.$evalAsync(function (scope) {
                // in this eval async will schedule a new digest circle here
                // rather than wait for someone or somewhere call the $digest function
            });

            expect(scope.counter).toBe(0);
            setTimeout(function () {
                expect(scope.counter).toBe(1);
                done();
            },100);
        });

        it("scope's $applyAsync will be invoked in next js tick", function (done) {
            scope.aValue = 'a';
            scope.counter = 0;

            scope.$watch(function (scope) {
                return scope.aValue;
            },function (newValue, oldValue, scope) {
                scope.counter ++;
            });

            expect(scope.counter).toBe(0);
            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$applyAsync(function (scope) { // this function will be executed in next tick
                scope.aValue = "b";
            });

            expect(scope.counter).toBe(1);

            setTimeout(function () {
                expect(scope.counter).toBe(2);
                done();
            },100);
        });

        it("never executes $applyAsync'ed function in the same digest circle", function (done) {
            scope.aValue = 'a';
            scope.executedInSameCircle = false;

            scope.$watch(function (scope) {
                return scope.aValue;
            }, function (newValue, oldValue, scope) {
                // here push a new applyAsync function
                scope.$applyAsync(function (scope) {
                    scope.executedInSameCircle = true;
                });
            });

            scope.$digest();
            expect(scope.executedInSameCircle).toBe(false);
            setTimeout(function () {
                expect(scope.executedInSameCircle).toBe(true);
                done();
            },100);
        });

        it("only once $digest circle if we push multi applyAsync expression", function (done) {
            scope.aValue = 'a';
            scope.counter = 0;
            scope.$watch(function (scope) {
                return scope.aValue;
            }, function (newValue, oldValue, scope) {
                scope.counter++;
            });

            expect(scope.counter).toBe(0);
            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$applyAsync(function (scope) {
                scope.aValue ='b';
            });

            scope.$applyAsync(function (scope) {
                scope.aValue ='c';
            });

            setTimeout(function () {
                expect(scope.counter).toBe(2);// not 3
                done();
            },100);
        });

        it("cancels and flushes $applyAsync if digested first", function (done) {
            scope.aValue = 'a';
            scope.counter = 0;

            scope.$watch(function (scope) {
                return scope.aValue;
            },function (newValue, oldValue, scope) {
                scope.counter++;
            });

            expect(scope.counter).toBe(0);
            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$applyAsync(function (scope) {
                scope.aValue ='b';
            });

            expect(scope.counter).toBe(1);

            scope.$applyAsync(function (scope) {
                scope.aValue ='c';
            });

            expect(scope.counter).toBe(1);

            scope.$digest();// this digest will flush all the applyAsync'ed expression
            expect(scope.counter).toBe(2);

            setTimeout(function () {
                expect(scope.counter).toBe(2);
                done();
            },100);

        });

        it("runs a $$postDigest function after each digest", function () {
            scope.counter = 0;

            scope.$$postDigest(function () {
                scope.counter++;
            });

            expect(scope.counter).toBe(0);

            scope.$digest();
            expect(scope.counter).toBe(1);

            scope.$digest();
            expect(scope.counter).toBe(1);
        });

        it("will not trigger a new digest circle if change the watch value in the $$postDigest", function () {
            scope.aValue = 'a';

            scope.$watch(function (scope) {
                return scope.aValue;
            }, function (newValue, oldValue, scope) {
                scope.watchedValue = newValue;
            });

            scope.$$postDigest(function () {
                scope.aValue = "b";
            });

            scope.$digest(); // after the digest , aValue will be changed
            expect(scope.watchedValue).toBe('a');
            expect(scope.aValue).toBe('b');

            // trigger a new digest , watchedValue will be catched
            scope.$digest(); // after the digest , aValue will be changed
            expect(scope.watchedValue).toBe('b');
        });

        it("catches expections in watch functions and continues", function () {
            scope.aValue = 'a';
            scope.counter = 0;

            scope.$watch(function (scope) {
                throw "someError";
            },function (newValue, oldValue, scope) {

            });


            scope.$watch(function (scope) {
                return scope.aValue;
            },function (newValue, oldValue, scope) {
                scope.counter ++;
            });

            scope.$digest();
            expect(scope.counter).toBe(1); // expection will not bother the next watch function
        });

        it("catches expections in listener functions and continues", function () {
            scope.aValue = 'a';
            scope.counter = 0;

            scope.$watch(function (scope) {
                return scope.aValue;
            },function (newValue, oldValue, scope) {
                throw "someError";
            });

            scope.$watch(function (scope) {
                return scope.aValue;
            },function (newValue, oldValue, scope) {
                scope.counter ++;
            });

            scope.$digest();
            expect(scope.counter).toBe(1); // expection will not bother the next listener function
        });
    });
});
