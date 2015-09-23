/**
 * jQuery plugin for basic BEM manipulations.
 * 
 * @author Max Shirshin
 * @version 2.2.0
 * 
 */
(function($, undefined) {

    var BEMsyntax = {
            elem: '__',
            modBefore: '_',
            modKeyVal: '_'
        },
        getEventPattern = function(block, elem, modName, modVal) {
            return block + (elem !== undefined ? BEMsyntax.elem + elem : '') +
                BEMsyntax.modBefore + modName + BEMsyntax.modKeyVal +
                (typeof modVal === 'boolean' ? '*' : (modVal || '*'));
        },
        getElemClasses = function(domEl) {
            if (domEl.classList) {
                return $.makeArray(domEl.classList);
            } else {
                return $.trim(domEl.className).split(/\s+/);
            }
        };

    $.setBEMsyntax = function(props) {
        if (typeof props !== 'object') return;

        for (var prop in props) {
            if (props.hasOwnProperty(prop) && BEMsyntax.hasOwnProperty(prop)) {
                BEMsyntax[prop] = props[prop];
            }
        }

        return $.extend({}, BEMsyntax);
    };

    $.extend($.fn, {
        getMod: function(block, elem, modName) {
            if (modName === undefined) {
                modName = elem;
                elem = undefined;
            }
            
            if (this.length) {
                var classPattern = block + (elem !== undefined ? BEMsyntax.elem + elem : '') +
                        BEMsyntax.modBefore + modName,
                    modVal = false;
                
                $.each(getElemClasses(this.get(0)), function(i, c) {
                    if (c === classPattern) {
                        modVal = true;
                        return false;
                    } else if (c.indexOf(classPattern) === 0
                        && c.substr(classPattern.length, BEMsyntax.modKeyVal.length) === BEMsyntax.modKeyVal) {

                        modVal = c.substr(classPattern.length + BEMsyntax.modKeyVal.length);
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
                var $this = $(this),
                    classPattern = block + (elem !== undefined ? BEMsyntax.elem + elem : '') +
                        BEMsyntax.modBefore + modName;
                
                if (modVal === false) {
                    $this.removeClass(classPattern);
                } else if (modVal === true) {
                    $this.addClass(classPattern);
                } else {
                    $.each(getElemClasses(this), function(i, c) {
                        if (c.indexOf(classPattern) === 0
                            && c.substr(classPattern.length, BEMsyntax.modKeyVal.length) === BEMsyntax.modKeyVal) {

                            $this.removeClass(c);
                        }
                    });
                    
                    $this.addClass(classPattern + BEMsyntax.modKeyVal + modVal);
                }
                
                // after the modifier is set, run the corresponding custom event
                var args = {
                    block: block,
                    elem: elem,
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
        },

        hasMod: function(block, elem, modName) {
            return !! this.getMod(block, elem, modName);
        }
    });
    
})(jQuery);