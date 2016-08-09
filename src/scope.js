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
}

function initWatchVal() {

}

Scope.prototype.$watch = function (watchFn, listenerFn) {
    var self = this;
    var watcher = {
        watchFn: watchFn,
        listenerFn:listenerFn || function(){},
        last: initWatchVal
    };

    self.$$watchers.push(watcher);
    self.$$lastDirtyWatch = null;
};


Scope.prototype.$$digestOnce = function () {
    var self = this;
    var dirty = false;
    var newValue, oldValue;
    _.forEach(this.$$watchers, function (watcher) {
        newValue = watcher.watchFn(self);
        oldValue = watcher.last;
        if(newValue !== oldValue){ // here only compare the object reference, not the value
            self.$$lastDirtyWatch = watcher;
            watcher.last = newValue;
            watcher.listenerFn(newValue, (oldValue === initWatchVal ? newValue: oldValue), self);
            dirty = true;
        }
        else if(self.$$lastDirtyWatch === watcher){
            return false;
        }
    });
    return dirty;
};


Scope.prototype.$digest = function () {
    var self = this;
    var dirty = false;
    var ttl = 10;
    this.$$lastDirtyWatch = null;
    do{
        dirty = self.$$digestOnce();
        if(dirty && !(ttl--)){
            throw "10 digest iterations reached";
        }
    }while(dirty);

};
