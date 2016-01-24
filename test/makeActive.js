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
