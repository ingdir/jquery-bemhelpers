/**
 * jQuery plugin for basic BEM manipulations.
 * 
 * @author Max Shirshin
 * @version 2.1.0
 * 
 */
(function($, undefined) {

    var getEventPattern = function(block, elem, modName, modVal) {
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
                
                // after the modifier is set, run the corresponding custom event
                var args = {
                    modName: modName,
                    modVal: modVal
                };

                // trigger the wildcard event pattern first
                $this.trigger('setMod:' + getEventPattern(block, elem, modName), args);
                // for boolean modifiers, one can only use the wildcard pattern,
                // so no need to trigger the same event twice
                if (typeof modVal !== 'boolean') {
                    $this.trigger('setMod:' + getEventPattern(block, elem, modName, modVal), args);
                }
            });
        }
    });
    
})(jQuery);