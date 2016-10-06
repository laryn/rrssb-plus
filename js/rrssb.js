/*!
 Simple Responsive Social Sharing Buttons
*/

+(function(window, $, undefined) {
    'use strict';
    var defaults = {
      shrink: 0.8,
      regrow: 0.8,
      minRows: 1,
      maxRows: 2,
      maxPrefix: 0.3,
    };

    /*
     * Public Function
     */
    $.fn.rrssbInit = function(settings) {
      // Set all buttons to match width of largest.
      // This width stays no matter what sizing, but it may get constrained down by a max-width.
      // In the case where the buttons are in a float with no fixed width, having the full
      // width set on each button ensures that the float is able to grow back up from no-labels to having labels again.
      var buttonWidth = 0;
      $('li', this).each(function() {
        buttonWidth = Math.max(buttonWidth, $(this).innerWidth());
      });
      $('li', this).width(buttonWidth);

      // Store data.
      $(this).data('settings', $.extend(defaults, settings));
      $(this).data('orig-width', buttonWidth);
      $(this).data('orig-height', $('li', this).innerHeight());
      $(this).data('orig-font-size', parseFloat($(this).css("font-size")));
      $(this).data('prefix-width', $('.rrssb-prefix', this).innerWidth());

      rrssbFix.call(this);
    };

    /*
     * Main recalculte sizes function.
     * $(this) points to an instance of .rrssb
     */
    var rrssbFix = function() {
      var settings = $(this).data('settings');
      var buttonWidth = $(this).data('orig-width');
      var buttons = $('li', this).length;
      // Modern browsers have sub-pixel support, so an element can have a fractional width internally.
      // This can get rounded up in the result of innerWidth, so subtract 1px to get a safe width.
      var containerWidth = $(this).innerWidth() - 1;

      var prefixWidth = $(this).data('prefix-width');
      if (prefixWidth > containerWidth * settings.maxPrefix) {
        prefixWidth = 0;
      }

      var maxButtonWidth = containerWidth / settings.shrink - prefixWidth;
      var buttonsPerRow = Math.floor(maxButtonWidth / buttonWidth);
      var rowsNeeded = Math.max(settings.minRows, Math.ceil(buttons / buttonsPerRow));

      // Fix labels.
      if (rowsNeeded > settings.maxRows) {
        $(this).addClass('no-label');
        // Without label, button is square so width equals original height.
        buttonWidth = $(this).data('orig-height');
        buttonsPerRow = Math.floor(maxButtonWidth / buttonWidth);
        rowsNeeded = Math.max(settings.minRows, Math.ceil(buttons / buttonsPerRow));
      }
      else {
        $(this).removeClass('no-label');
      }

      // Set max width.
      // Using width doesn't work well if the buttons are inside a non-fixed-size container.
      buttonsPerRow = Math.ceil(buttons / rowsNeeded);
      var percWidth = Math.floor(10000 / buttonsPerRow) / 100;
      $('li', this).css('max-width', percWidth + '%');

      // Fix font size.
      var desiredWidth = buttonWidth * buttonsPerRow + prefixWidth;
      var scale = Math.min(1, containerWidth / desiredWidth);
      if (rowsNeeded > settings.minRows) {
        scale = Math.min(scale, settings.regrow);
      }

      if (scale < 1) {
        // Reduce font size.
        // Reduce calculated value slightly as browser size calculations have some rounding and approximation.
        var fontSize = $(this).data('orig-font-size') * scale * 0.95;
        $(this).css('font-size', fontSize + 'px');
      }
      else {
        $(this).css('font-size', '');
      }

      var ulWidth = buttonWidth * buttonsPerRow * scale;
      $('ul', this).css('max-width', ulWidth + 'px');
    };

    var popupCenter = function(url, title, w, h) {
      // Fixes dual-screen position                         Most browsers      Firefox
      var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
      var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

      var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
      var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

      var left = ((width / 2) - (w / 2)) + dualScreenLeft;
      var top = ((height / 3) - (h / 3)) + dualScreenTop;

      var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

      // Puts focus on the newWindow
      if (newWindow && newWindow.focus) {
        newWindow.focus();
      }
    };

    var waitForFinalEvent = (function () {
        var timers = {};
        return function (callback, ms, uniqueId) {
          if (!uniqueId) {
            uniqueId = "Don't call this twice without a uniqueId";
          }
          if (timers[uniqueId]) {
            clearTimeout(timers[uniqueId]);
          }
          timers[uniqueId] = setTimeout(callback, ms);
        };
    })();

    // init load
    $(document).ready(function(){
        /*
         * Event listners
         */

        $('.rrssb-buttons a.popup').click(function popUp(e) {
            var self = $(this);
            popupCenter(self.attr('href'), self.find('.rrssb-text').html(), 580, 470);
            e.preventDefault();
        });

        // resize function
        $(window).resize(function () {
            waitForFinalEvent(function() {$('.rrssb').each(rrssbFix);}, 200, "finished resizing");
        });

        $('.rrssb').rrssbInit();
    });

})(window, jQuery);
