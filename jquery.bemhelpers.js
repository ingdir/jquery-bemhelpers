/**
 * jQuery plugin for basic BEM manipulations.
 * 
 * @author Max Shirshin
 * @version 2.0.0
 * 
 */
(function($, undefined) {
    
    var bemModMap = 'bemHelpers:modMap',  // unique key for jQuery data storage
        // kind of a hash function to store callbacks
        // for a specific block/element/modifier combo
        getMapKey = function(block, elem, modName, modVal) {
            return block + (elem !== undefined ? '__' + elem : '') + '_' + modName + '_' + (typeof modVal === 'boolean' ? '*' : (modVal || '*')); 
        },
        getElemClasses = function(domEl) {
            if (domEl.classList) {
                return domEl.classList;
            } else {
                return $.trim(domEl.className).split(/\s+/);
            }
        };
    
    $.extend($.fn, {
        getMod: function(block, elem, modName) {
            if (modName === undefined) {
                modName = elem;
                elem = undefined;
            }
            
            if (this.length) {
                var classPattern = block + (elem !== undefined ? '__' + elem : '') + '_' + modName,
                    modVal = false;
                
                $.each(getElemClasses(this.get(0)), function(i, c) {
                    if (c === classPattern) {
                        modVal = true;
                        return false;
                    } else if (c.indexOf(classPattern) === 0 && c.substr(classPattern.length, 1) === '_') {
                        modVal = c.substr(classPattern.length + 1);
                        return false;
                    }
                });
                
                return modVal;
                
            } else return undefined;
        },
        
        setMod: function(block, elem, modName, modVal) {
            if (modVal === undefined) {
                modVal = modName;
                modName = elem;
                elem = undefined;
            }
            
            return this.each(function() {
                var that = this,
                    $this = $(this),
                    classPattern = block + (elem !== undefined ? '__' + elem : '') + '_' + modName;
                
                if (modVal === false) {
                    $this.removeClass(classPattern);
                } else if (modVal === true) {
                    $this.addClass(classPattern);
                } else {
                    $.each(getElemClasses(this), function(i, c) {
                        if (c.indexOf(classPattern) === 0 && c.substr(classPattern.length, 1) === '_') {
                            $this.removeClass(c);
                        }
                    });
                    
                    $this.addClass(classPattern + '_' + modVal);
                }
                
                // the actions are run AFTER the class name is set
                var modMap = $this.data(bemModMap);
                if (modMap) {
                    // universal callbacks for all modifier values '*' 
                    var fnGlobalArrayRef = modMap[getMapKey(block, elem, modName)] || [],
                        // specific values    
                        fnArrayRef = modMap[getMapKey(block, elem, modName, modVal)] || [];

                    $.each(fnGlobalArrayRef.concat(fnArrayRef), function(i, fn) {
                        // "this" is set to a current element
                        fn.call(that, modName, modVal, block, elem);
                    });
                }
            });
        },
        
        onSetMod: function(block, elem, modMap) {
            if (modMap === undefined) {
                modMap = elem;
                elem = undefined;
            }
            
            return this.each(function() {
                var $this = $(this),
                    exModMap = $this.data(bemModMap);
                
                if (typeof exModMap !== 'object') {
                    exModMap = {};
                    $this.data(bemModMap, exModMap);
                }
                
                $.each(modMap, function(modName, val) {
                    var key;
                    if ($.isFunction(val)) {
                        key = getMapKey(block, elem, modName);
                        exModMap[key] = exModMap[key] || [];
                        exModMap[key].push(val);
                    } else if (typeof val === 'object') {
                        $.each(val, function(modVal, fn) {
                            if ($.isFunction(fn)) {
                                key = getMapKey(block, elem, modName, modVal);

                                exModMap[key] = exModMap[key] || [];
                                exModMap[key].push(fn);
                            }
                        });
                    }
                });
            });
        }
    });
    
})(jQuery);