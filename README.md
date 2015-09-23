# jquery-bemhelpers

BEM helpers for jQuery 

## Why you might need it

[BEM](http://getbem.com) (Block, Element, Modifier) is a popular front-end methodology that introduces unified semantic entities across different frontend technologies such as CSS, HTML, JavaScript and templates.

BEM is not tied to any particular implementation or framework. This jQuery plugin provides basic support for working with modifiers and setting up callbacks based on modifier change.

## Naming convention

This plugin supports multiple BEM naming conventions.

By default, it uses BEM naming convention introduced by [Yandex](http://yandex.com):

  * CSS class names are used to denote BEM entities
  * Blocks with and without prefix are supported
  * Elements: block<strong>__element</strong>
  * Boolean modifiers: block<strong>_mod</strong>, block__element<strong>_mod</strong>
  * Key/value modifiers: block<strong>_modname_modval</strong>, block__element<strong>_modname_modval</strong>

You can set alternative naming conventions by calling the `$.BEMsyntax` method:

```javascript
// to read the existing syntax
var currentSyntax = $.BEMsyntax();

// to set a new syntax
var newSyntax = $.BEMsyntax({
    elem: '__',  // separator between block and element name
    modBefore: '--',  // separator between block/element and modifier name
    modKeyVal: '_'  // separator between modifier key and modifier value
});
```

You can omit some properties if you inherit them from a previously defined scheme or default Yandex scheme.
Changes are effective immediately and persist until you change them again.

`newSyntax` contains an object describing the new syntax (all fields).

## setMod

`.setMod` sets a block modifier on each element of a jQuery collection, and returns the same collection.

### Set a boolean modifier on a block:

`.setMod(blockName, modName, true|false)`

Sets a boolean modifier `modName` for each block `blockName` in a provided jQuery collection.
Third argument is the modifier value: `true` adds a modifier, `false` removes it.

According to BEM, the DOM element that receives a modifier also needs the original block or element CSS class to be assigned (so, modifier classes are never used standalone). Currently, the library does not check or enforce this rule, but might start doing that in any future release.

Example usage:
```javascript
$('.b-widget').setMod('b-widget', 'hidden', false);
```

### Set a boolean modifier on an element:

`.setMod(blockName, elemName, modName, true|false)`

Same as above, but the second argument is an element name.

### Set a key/value modifier on a block:

Key/value modifiers are different from boolean modifiers in that they have distinct string values. Values follow the same limitations as modifier names do; namely, they cannot contain underscores and should comply with general limitations of CSS class names.

`.setMod(blockName, modName, modVal)`

*modVal* should not be a boolean value, otherwise it will be treated as a boolean modifier.

### Set a key/value modifier on an element:

`.setMod(blockName, elemName, modName, modVal)`

*modVal* should not be a boolean value.

## getMod

This is a simple API to read modifier values. It only reads the *first* element in a jQuery collection, ignoring all the rest, and returns a primitive value based on what it finds.

For blocks:

`.getMod(blockName, modName)`

For elements:

`.getMod(blockName, elemName, modName)`

It returns boolean `true` for a boolean modifier that exists, a `String` modifier value for a key/value modifier that exists, and boolean `false` for a modifier that was not found (as it is not there, there is no way to determine whether we're dealing with a boolean or key/value modifier).

For an empty jQuery collection, the method would return `undefined`. This might be an inconsistency; I may change it later.

## hasMod

`.hasMod` checks whether the first item in a jQuery collection has a modifier set on a specified block/element.

Returns a boolean value. For key/value modifiers, return `true` if any modifier value is present, regardless of the actual value.

For blocks:

```javascript
var hasMod = $('.b-block').hasMod('b-block', 'expanded');
```

For elements:

```javascript
var hasMod = $('.b-block__elem').hasMod('b-block', 'elem', 'expanded');
```

## Event handlers

For each modifier being set, a jQuery `setMod` event is being triggered that propagates up the DOM tree. It also contains metadata that lets you get additional information. This allows for callbacks being assigned to modifier changes.

### Subscribing to setMod events

For each modifier being set, a custom jQuery event fires which unique name is formed according to a pattern that is described below. The event also contains metadata you can read from the second argument of an event handler.

For all modifiers (both boolean and key/value pairs), the custom event is formed like this:

`setMod:block_modName_*`  // for blocks
`setMod:block__elem_modName_*`  // for elements

If you define a custom BEM syntax with `$.BEMsyntax()` method, you should adjust your event name patterns accordingly. Events being triggered always use the current syntax.

An asterisk `*` at the end of an event name means it's triggered for all modifier values. An object passed as a second argument to an event handler contains additional keys:

   * `block` — block name
   * `elem` — element name (`undefined` if modifier is set on a block level)
   * `modName` — modifier name
   * `modVal` — modifier value that is set: a boolean `true`/`false` for boolean modifiers, a `String` value for key/value modifiers

For key/value modifier *only*, and *additional* event is triggered which is specific to a modifier value being set. Its custom name is formed like this:

`setMod:block_modName_modVal`  // for blocks
`setMod:block__elem_modName_modVal`  // for elements

Example:

```javascript
$(document).on('setMod:widget_init_*', function(e, data) {
    console.log('Block name:', data.block);
    console.log('Element name:', data.elem);  // undefined, as it's a block-level modifier
    console.log('Modifier name:', data.modName);
    console.log('Modifier value:', data.modVal);
});

$('div.widget').setMod('widget', 'init', true);
/* Console output:

>  Block name: widget
>  Element name: undefined
>  Modifier name: init
>  Modifier value: true

*/
```
