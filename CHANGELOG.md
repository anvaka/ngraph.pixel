# [2.0.0] Jan 9 - 2015

## Added optional config to customize UI creation:

``` js
var renderer = createRenderer(graph, {
  link: function (link) {
    // if you return undefiend - the UI for this link will not be rendered.
    // Otherwise:
    return {
      fromColor: 0xFFFFFF,
      toColor: 0xFFFFFF
    }
  },
  node: function (node) {
    // if you return undefined - the UI for this node will not be rendered.
    return {
      color: 0xFF0000,
      size: 40
    }
  }
});
```

## `linkColor()` is removed

Use `fromColor`, `toColor` properties on link object itself.

**Before**

``` js
renderer.linkColor(link.id,  0xffffff, 0x000000);
```

**After**

``` js
var ui = renderer.getLink(link.id);
ui.fromColor = 0xffffff;
ui.toColor = 0xffffff;
```

## `nodeColor()`/`nodeSize()` is removed

Use UI properties instead.

**Before**

``` js
renderer.nodeSize(node.id, 20);
renderer.nodeColor(node.id, 0xffffff);
```

**After**

```
var ui = renderer.getNode(node.id);
ui.size = 20;
ui.color = 0xffffff;
```
