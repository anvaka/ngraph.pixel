var test = require('tap').test;
var makeActive = require('../lib/makeActive.js');

test('it can listen to actived objects', function(t) {
  var obj = makeActive({ name: 'John' });

  obj.connect('name', onNameChanged);
  obj.name = 'Bob';

  function onNameChanged(model) {
    t.ok(model === obj, 'model is the same as source object');
    t.equals(model.name, 'Bob', 'Name is changed');
    t.end();
  }
});

test('it can unsubscribe from activated objects', function(t) {
  var obj = makeActive({ name: 'John' });
  var calledCount = 0;

  obj.connect('name', onNameChanged);
  obj.name = 'Bob';
  obj.disconnect('name', onNameChanged);
  obj.name = 'Shmob';
  t.equals(calledCount, 1, 'Called exactly once');
  t.end();

  function onNameChanged() {
    calledCount += 1;
    t.equals(calledCount, 1, 'Called once!');
  }
});

test('it can listen to nested objects', function(t) {
  var obj = makeActive({ user: {name: 'John' }});
  obj.connect('user.name', onNameChanged);
  obj.user.name = 'Bob';

  function onNameChanged(model) {
    t.ok(model === obj, 'model is the same as source object');
    t.equals(model.user.name, 'Bob', 'Name is changed');
    t.end();
  }
});

test('it can listen to nested object parents', function(t) {
  var obj = makeActive({ user: {name: 'John' }});
  obj.connect('user', onNameChanged);
  obj.user = {
    name: 'Bob'
  };

  function onNameChanged(model) {
    t.ok(model === obj, 'model is the same as source object');
    t.equals(model.user.name, 'Bob', 'Name is changed');
    t.end();
  }
});

test('it can unsubscribe from nested objects', function(t) {
  var calledCount = 0;
  var obj = makeActive({ user: {name: 'John' }});
  obj.connect('user.name', onNameChanged);
  obj.user.name = 'Bob';
  obj.disconnect('user.name', onNameChanged);
  obj.user.name = 'Shmob';
  t.equals(calledCount, 1, 'Called exactly once');
  t.end();

  function onNameChanged() {
    calledCount += 1;
    t.equals(calledCount, 1, 'Called once!');
  }
});

test('it can listen to both nested and parent objects', function(t) {
  var bobChanged = 0;
  var userChanged = 0;
  var obj = makeActive({ user: {name: 'John' }});
  obj.connect({
    'user.name': onBobChanged,
    user: onUserChanged
  });

  obj.user.name = 'Bob';
  obj.user = 'oops!'

  t.equals(bobChanged, 1, 'bob called exactly once');
  t.equals(userChanged, 1, 'user called exactly once');
  t.end();

  function onBobChanged() {
    bobChanged += 1;
    t.equals(bobChanged, 1, 'bob changed once');
  }

  function onUserChanged() {
    userChanged += 1;
    t.equals(userChanged, 1, 'user changed once');
  }
});
