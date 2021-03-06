function EntryBox() {
    var that = this;
    this.entryJQ = $("#contribution");
    this.entryBox = this.entryJQ[0];
    
    EntryBox.prototype.checkRemainingCharacters = function() {
        if (!(this.value || that.entryBox)) {
            return;
        }
        var totalChars = (this.value || that.entryBox.value).length;
        var MAX_CHARS = 280;
        var remaining = MAX_CHARS - totalChars;
                
        $('#visibleText').text('...' + that.entryBox.value.substring(Math.max(that.entryBox.value.length - 50, 0), that.entryBox.value.length));

        var charWarning = $("#charwarning");
        if (remaining >= 0) {
            charWarning.removeClass('gonebad');
            charWarning.text(remaining + ' characters remaining');
            that._remainingCharsValid = (totalChars > 0);
            that.entryJQ.trigger('validate');
            
            return that._remainingCharsValid;
        } else {
            charWarning.addClass('gonebad');
            charWarning.text((-remaining) + ' characters too many');
            that._remainingCharsValid = false;
            that.entryJQ.trigger('validate');
            return false;
        }
    }
    
    EntryBox.prototype.isValid = function() {
        return that._remainingCharsValid;
    }
    
    EntryBox.prototype.getValue = function() {
        return that.entryBox.value;
    }
    
    EntryBox.prototype.bind = function(event, func) {
        that.entryJQ.bind(event, func);
    }
    
    this.entryJQ.blur(this.checkRemainingCharacters);
    this.entryJQ.keyup(this.checkRemainingCharacters);
}