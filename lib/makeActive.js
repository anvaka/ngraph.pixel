// This module allows to replace object properties with getters/setters,
// so consumers can "connect" to them and be notified when properties are
// updated.
module.exports = makeActive;

function makeActive(model) {
  if (!model) throw new Error('Model is required to be an object');
  if (typeof model.connect === 'function') throw new Error('connect() alread exists on model');
  if (typeof model.disconnect === 'function') throw new Error('disconnect() alread exists on model');

  var connected = new Map();

  model.connect = connect;
  model.disconnect = disconnect;

  return model;

  function replaceProperty(name) {
    var propertyDescriptor = Object.getOwnPropertyDescriptor(model, name);
    if (!propertyDescriptor) return false; // there is no such name!
    if (propertyDescriptor && typeof propertyDescriptor.get === 'function') return true; // Already replaced

    var value = model[name];

    Object.defineProperty(model, name, {
      get: function() { return value; },
      set: function(v) {
        value = v;
        triggerListeners(name);
      }
    });

    return true;
  }

  function triggerListeners(name) {
    var myListeners = connected.get(name);
    if (!myListeners) return;

    myListeners.forEach(function(listener) {
      listener(model);
    });
  }

  function connect(key, cb) {
    if (typeof key === 'string') {
      connectSingleKey(key, cb);
      return;
    }

    var query = key;

    Object.keys(key).forEach(connectOneKey);

    function connectOneKey(keyName) {
      connectSingleKey(keyName, query[keyName]);
    }
  }

  function connectSingleKey(key, cb) {
    var parts = key.split('.');
    var myListeners = connected.get(key);

    if (!myListeners) {
      var propertyCreated = replaceProperty(parts[0]);
      if (!propertyCreated) {
        console.error('trying to connect to property ' + parts[0] + ' that is not part of the model');
        return;
      }

      myListeners = new Set();
      connected.set(key, myListeners);
    }

    if (parts.length === 1) {
      myListeners.add(cb);
    } else {
      // handling case for composite path. E.g.:
      //  model.connect('from.position', cb)
      // this means that consumer wants to be notified when from.position
      // has changed
      var connector = model[parts[0]];
      var rest = parts.slice(1).join('.');

      // remember the original function, so that we can find and delete it on disconnect
      forwardModel.cb = cb;
      myListeners.add(forwardModel);

      // forward connection to request to property:
      if (typeof connector.connect !== 'function') {
        makeActive(connector);
      }
      connector.connect(rest, forwardModel);
    }

    function forwardModel(/* subModel */) {
      // todo: this could probably use model from sub properties...
      cb(model);
    }
  }

  function disconnect(key, cb) {
    if (typeof key === 'string') return deleteSingleKey(key, cb);

    Object.keys(key).forEach(function(name) {
      deleteSingleKey(name, key[name]);
    });
  }

  function deleteSingleKey(key, cb) {
    var myListeners = connected.get(key);
    // todo: composite?
    if (!myListeners) return;
    if (myListeners.delete(cb)) return; // callback was succesfully deleted
    // otherwise let's check if we are in composite mode:
    var parts = key.split('.');
    if (parts.length === 1) return; // no, we are not in composite, just have no such listener

    // yes, we are in composite key. Need to iterate all subscribers to find
    // which one is trying to disconnect
    var found;
    myListeners.forEach(function(subscriber) {
      if (subscriber.cb === cb) {
        found = subscriber;
      }
    });

    if (found) {
      // first delete it from our level of listeners
      myListeners.delete(found);

      // then forward disconnect request to the child models:
      var connector = model[parts[0]];
      var rest = parts.slice(1).join('.');
      connector.disconnect(rest, found);
    }
  }
}
