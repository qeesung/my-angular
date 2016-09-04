/**
 * author      : qeesung
 * email       : 1245712564@qq.com
 * filename    : scope.js
 * create time : Sat Aug  6 13:54:25 2016
 * description : angualr scope
 */

function Scope() {
    this.$$watchers = [];
    this.$$lastDirtyWatch = null;
    this.$$asyncQueue = [];
    this.$$asyncApplyQueue = [];
    this.$$asyncApplyId = null;
    this.$$phase = null;
    this.$$postDigestQueue = [];
}

function initWatchVal() {

}

Scope.prototype.$watch = function (watchFn, listenerFn, baseValue) {
    var self = this;
    var watcher = {
        watchFn: watchFn,
        listenerFn:listenerFn || function(){},
        last: initWatchVal,
        isBaseValue: !!baseValue || false
    };

    self.$$watchers.push(watcher);
    self.$$lastDirtyWatch = null;
};


Scope.prototype.$$digestOnce = function () {
    var self = this;
    var dirty = false;
    var newValue, oldValue;
    _.forEach(this.$$watchers, function (watcher) {
        try{
            newValue = watcher.watchFn(self);
            oldValue = watcher.last;
            if(!self.$$areEqual(newValue, oldValue, watcher.isBaseValue)){ // here only compare the object reference, not the value
                self.$$lastDirtyWatch = watcher;
                watcher.last = (watcher.isBaseValue ? _.cloneDeep(newValue): newValue); // if not deep clone the newValue, the newValue and oldValue will always equal, because they are same object
                watcher.listenerFn(newValue, (oldValue === initWatchVal ? newValue: oldValue), self);
                dirty = true;
            }
            else if(self.$$lastDirtyWatch === watcher){
                return false;
            }
        }
        catch(e){
            console.log(e);
        }
    });
    return dirty;
};


Scope.prototype.$digest = function () {
    var self = this;
    var dirty = false;
    var ttl = 10;
    this.$$lastDirtyWatch = null;
    this.$beginPhase("$digest");

    if(self.$$asyncApplyId){
        clearTimeout(self.$$asyncApplyId);
        self.$$flushApplyAsync();
    }

    do{
        while(self.$$asyncQueue.length > 0){
            var asyncTask = self.$$asyncQueue.shift();
            asyncTask.scope.$eval(asyncTask.expression);
        }
        dirty = self.$$digestOnce();
        // after 10 times , if the dirty is still not clean or async queue still has tasks, then throw a exception
        if((dirty || self.$$asyncQueue.length) && !(ttl--)){
            throw "10 digest iterations reached";
        }
    }while(dirty || this.$$asyncQueue.length);

    while(self.$$postDigestQueue.length){
        self.$$postDigestQueue.shift()();
    }
    this.$clearPhase();
};

Scope.prototype.$$areEqual = function (newValue, oldValue, baseValue) {
    if(!!baseValue){
        return _.isEqual(newValue, oldValue);
    }
    else{
        return newValue === oldValue ||
            (typeof newValue === 'number' && typeof oldValue === 'number' && // need to check the type,because the js object isNaN(<object>) is true
             isNaN(newValue) && isNaN(oldValue)) ;
    }
};

Scope.prototype.$eval = function (expression, args) {
    return expression(this, args);
};

/**
 * take from the angular official website
 * Scope's $apply() method transitions through the following stages:
 *
 *  1. The expression is executed using the $eval() method.
 *  2. Any exceptions from the execution of the expression are forwarded to the $exceptionHandler service.
 *  3. The watch listeners are fired immediately after the expression was executed using the $digest() method.
 */

Scope.prototype.$apply = function(expression, args){
    var self = this;
    try{
        this.$beginPhase("$apply");
        self.$eval(expression, args);
    }
    catch(e){
        // ignore the exception
    }
    finally{
        self.$digest();
        this.$clearPhase();
    }
};

/**
 * push a new express into the async queue
 */
Scope.prototype.$evalAsync = function (expression) {
    // in order to schedule a new digeest circle whenever call this funciton
    // we need shcedule the function expression in next time tick mannaully
    var self = this;
    if(!self.$$phase && !self.$$asyncQueue.length){
        setTimeout(function () {
            // here will start a digest circle
            if(self.$$asyncQueue.length)
                self.$digest(); // this digest will be invoke in next tick
        }, 0);
    }
    this.$$asyncQueue.push({scope:this,expression:expression}); // a new async task will be scheduled in this tick
};


/**
 * define some interface to deal the $$phase variable
 */

Scope.prototype.$beginPhase = function (_phase) {
    if(_phase === null)
        throw this.$$phase + " already in progress";
    else
        this.$$phase = _phase;
};

Scope.prototype.$clearPhase = function () {
    this.$$phase = null;
};

/**
 * those notes from angular official website
 * $applyAsync([exp]);
 *   Schedule the invocation of $apply to occur at a later time. The actual time difference varies across browsers, but is typically around ~10 milliseconds.
 *   This can be used to queue up multiple expressions which need to be evaluated in the same digest., here such as multiple http requests , and get the multiple http
 *   responses, here we can push all functions that deal http responses to a same applyAsync
 */

Scope.prototype.$applyAsync = function (expression) {
    var self = this;
    self.$$asyncApplyQueue.push(function () {
        self.$eval(expression);
    });
    // defer those functions exection in next js tick
    // all pushed expression will be executed in same $apply function
    // and only once $digest would be executed
    if(this.$$asyncApplyId === null)
    {
        this.$$asyncApplyId =  setTimeout(function () {
            self.$apply(_.bind(self.$$flushApplyAsync, self));
        },0);
    }
};


Scope.prototype.$$flushApplyAsync = function () {
    var self = this;
    while(self.$$asyncApplyQueue.length){
        self.$$asyncApplyQueue.shift()();
    };
    self.$$asyncApplyId = null;
};


Scope.prototype.$$postDigest = function (postFunction) {
    this.$$postDigestQueue.push(postFunction);
};
