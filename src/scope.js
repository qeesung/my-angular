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
