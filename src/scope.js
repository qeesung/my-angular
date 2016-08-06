/**
 * author      : qeesung
 * email       : 1245712564@qq.com
 * filename    : scope.js
 * create time : Sat Aug  6 13:54:25 2016
 * description : angualr scope
 */

function Scope() {
    this.$$watchers = [];
}

function initWatchVal() {

}

Scope.prototype.$watch = function (watchFn, listenerFn) {
    var self = this;
    var watcher = {
        watchFn: watchFn,
        listenerFn:listenerFn,
        last: initWatchVal
    };

    self.$$watchers.push(watcher);
};


Scope.prototype.$digest = function () {
    var self = this;
    var newValue, oldValue;
    _.forEach(this.$$watchers, function (watcher) {
        newValue = watcher.watchFn(self);
        oldValue = watcher.last;
        if(newValue !== oldValue){ // here only compare the object reference, not the value
            watcher.last = newValue;
            watcher.listenerFn(newValue, (oldValue === initWatchVal ? newValue: oldValue), self);
        }
    });
};
