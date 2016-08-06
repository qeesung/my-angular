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


Scope.prototype.$watch = function (watchFn, listenerFn) {
    var self = this;
    var watcher = {
        watchFn: watchFn,
        listenerFn:listenerFn
    };

    self.$$watchers.push(watcher);
};


Scope.prototype.$digest = function () {
    _.forEach(this.$$watchers, function (watcher) {
        watcher.listenerFn();
    });
};
