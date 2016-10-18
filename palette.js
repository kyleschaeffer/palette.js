// picker
(function($){
    $.fn.picker = function(options){
        
        // configuration
        var picker = this;
        var settings = {
            width: 256,
            height: 256,
            color: {
                r: 255,
                g: 255,
                b: 255
            }
        };
        if(options){
            $.extend(settings, options);
        }
        
        // rgb color value -> hex
        picker.c2hex = function(c){
            var hex = Math.round(c).toString(16);
            return hex.length == 1 ? '0' + hex : hex;
        };
        
        // rgb -> hex
        picker.rgb2hex = function(rgb){
            return picker.c2hex(rgb.r) + picker.c2hex(rgb.g) + picker.c2hex(rgb.b);
        };
        
        // hex -> rgb
        picker.hex2rgb = function(hex){
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };
        
        // rgb -> hsv
        picker.rgb2hsv = function(rgb){
            var r = rgb.r / 255;
            var g = rgb.g / 255;
            var b = rgb.b / 255;
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, v = max;
            var d = max - min;
            s = max == 0 ? 0 : d / max;
            if(max == min){
                h = 0; // achromatic
            }else{
                switch(max){
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: h, s: s, v: v };
        };
        
        // hsv -> rgb
        picker.hsv2rgb = function(hsv){
            var r, g, b;
            var h = hsv.h;
            var s = hsv.s;
            var v = hsv.v;
            var i = Math.floor(h * 6);
            var f = h * 6 - i;
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);
            switch(i % 6){
                case 0: r = v, g = t, b = p; break;
                case 1: r = q, g = v, b = p; break;
                case 2: r = p, g = v, b = t; break;
                case 3: r = p, g = q, b = v; break;
                case 4: r = t, g = p, b = v; break;
                case 5: r = v, g = p, b = q; break;
            }
            return { r: r * 255, g: g * 255, b: b * 255 };
        };
        
        // create picker
        this.each(function(){
            
            // create widget
            var input = $(this);
            $(input).addClass('ui-cp-input');
            var widget = $('<div class="ui-cp" style="display: none;" />');
            $(input).after(widget);
            
            // add html
            $(widget).append('<div class="cp-col cp-box"><img width="' + settings.width + '" height="' + settings.height + '" src="palette.png" /><div class="cp-swatch"></div></div><div class="cp-col cp-bar"><canvas width="' + Math.round(settings.width / 8) + '" height="' + settings.height + '"></canvas><div class="cp-slide"></div></div><div class="cp-col cp-info"><div class="cp-color1"></div><div class="cp-color2"></div><div class="cp-stats"><div class="cp-stat"><label>R</label><input type="number" min="0" max="255" value="' + settings.color.r + '" /></div><div class="cp-stat"><label>G</label><input type="number" min="0" max="255" value="' + settings.color.g + '" /></div><div class="cp-stat"><label>B</label><input type="number" min="0" max="255" value="' + settings.color.b + '" /></div><div class="cp-stat"><label>#</label><input type="text" maxlength="6" value="' + picker.rgb2hex(settings.color) + '" /></div></div></div><div class="cp-actions"><button class="cp-save">Save</button><button class="cp-cancel">Cancel</button></div>');
            
            // get objects
            var box = $(widget).children('.cp-box').children('img');
            var swatch = $(widget).children('.cp-box').children('.cp-swatch');
            var bar = $(widget).children('.cp-bar').children('canvas');
            var slide = $(widget).children('.cp-bar').children('.cp-slide');
            var color1 = $(widget).find('.cp-color1');
            var color2 = $(widget).find('.cp-color2');
            var stat1 = $(widget).find('.cp-stats input:eq(0)');
            var stat2 = $(widget).find('.cp-stats input:eq(1)');
            var stat3 = $(widget).find('.cp-stats input:eq(2)');
            var stat4 = $(widget).find('.cp-stats input:eq(3)');
            var save = $(widget).find('.cp-save');
            var cancel = $(widget).find('.cp-cancel');
            
            // cancel dragging
            $(box).on('dragstart', function(e){
                e.preventDefault();
            });
            
            // hsv data
            $(widget).data('hsv', {
                h: 0,
                s: 1,
                v: 1
            });
            
            // move/drag swatch
            widget.swatchmove = function(e){
                
                // get offset
                var x = e.pageX - $(box).offset().left;
                var y = e.pageY - $(box).offset().top;
                
                // contain
                if(x < 0){
                    x = 0;
                }
                if(x > settings.width){
                    x = settings.width;
                }
                if(y < 0){
                    y = 0;
                }
                if(y > settings.height){
                    y = settings.height;
                }
                
                // pick new color
                $(widget).data('hsv').s = x / settings.width;
                $(widget).data('hsv').v = 1 - (y / settings.height);
                widget.pick();
                
            };
            
            // pick color
            widget.pick = function(){
                
                // get rgb
                var rgb = picker.hsv2rgb($(widget).data('hsv'));
                
                // update swatch
                $(swatch).css('left', ($(widget).data('hsv').s * settings.width) + 'px').css('top', ((1 - $(widget).data('hsv').v) * settings.height) + 'px').css('background-color', 'rgb(' + Math.round(rgb.r) + ', ' + Math.round(rgb.g) + ', ' + Math.round(rgb.b) + ')');
                
                // update palette
                $(color1).css('background-color', 'rgb(' + Math.round(rgb.r) + ', ' + Math.round(rgb.g) + ', ' + Math.round(rgb.b) + ')');
                
                // update stats
                $(stat1).val(Math.round(rgb.r));
                $(stat2).val(Math.round(rgb.g));
                $(stat3).val(Math.round(rgb.b));
                $(stat4).val(picker.rgb2hex(rgb));
                
            };
            
            // box events
            $(box).on('mousedown', function(e){
                if(e.which != 3){
                    $(box).attr('data-color', 'dragging');
                    widget.swatchmove(e);
                }
            });
            $(swatch).on('mousedown', function(e){
                if(e.which != 3){
                    $(box).attr('data-color', 'dragging');
                    widget.swatchmove(e);
                }
            });
            $(document).on('mousemove', function(e){
                if($(box).is('[data-color="dragging"]')){
                    widget.swatchmove(e);
                }
            });
            $(document).on('mouseup', function(e){
                $(box).attr('data-color', 'idle');
            });
            
            // draw bar
            var c = bar[0].getContext('2d');
            for(var i = 0; i <= settings.height; i++){
                
                // get color
                var hsv = { h: i / settings.height, s: 1, v: 1 };
                var rgb = picker.hsv2rgb(hsv);
                
                // line
                c.fillStyle = 'rgb(' + Math.round(rgb.r) + ', ' + Math.round(rgb.g) + ', ' + Math.round(rgb.b) + ')';
                c.fillRect(0, i, settings.width, 1);
                
            }
            
            // move/drag slide
            widget.slidemove = function(e){
                
                // get offset
                var y = e.pageY - $(bar).offset().top;
                
                // contain
                if(y < 0){
                    y = 0;
                }
                if(y > settings.height){
                    y = settings.height;
                }
                
                // set hue
                var hue = y / settings.height;
                $(widget).data('hsv').h = hue;
                
                // update hue
                widget.hue();
                
            };
            
            // pick hue
            widget.hue = function(){
                
                // get rgb color
                var rgb = picker.hsv2rgb({ h: $(widget).data('hsv').h, s: 1, v: 1 });
                
                // update slide
                $(slide).css('top', ($(widget).data('hsv').h * settings.height) + 'px').css('background-color', 'rgb(' + Math.round(rgb.r) + ', ' + Math.round(rgb.g) + ', ' + Math.round(rgb.b) + ')');
                
                // update box
                $(box).css('background-color', 'rgb(' + Math.round(rgb.r) + ', ' + Math.round(rgb.g) + ', ' + Math.round(rgb.b) + ')');
                
                // pick new color
                widget.pick();
                
            };
            
            // bar events
            $(bar).on('mousedown', function(e){
                if(e.which != 3){
                    $(bar).attr('data-color', 'dragging');
                    widget.slidemove(e);
                }
            });
            $(slide).on('mousedown', function(e){
                if(e.which != 3){
                    $(bar).attr('data-color', 'dragging');
                    widget.slidemove(e);
                }
            });
            $(document).on('mousemove', function(e){
                if($(bar).is('[data-color="dragging"]')){
                    widget.slidemove(e);
                }
            });
            $(document).on('mouseup', function(e){
                $(bar).attr('data-color', 'idle');
            });
            
            // goto color
            widget.goto = function(rgb){
                
                // convert to hsv
                var hsv = picker.rgb2hsv(rgb);
                
                // pick color
                $(widget).data('hsv', hsv);
                widget.hue();
                
            };
            
            // update rgb's
            widget.updatergb = function(){
                
                // get values
                var r = parseInt($(stat1).val()) || 0;
                var g = parseInt($(stat2).val()) || 0;
                var b = parseInt($(stat3).val()) || 0;
                
                // contain
                if(r < 0) r = 0;
                if(r > 255) r = 255;
                if(g < 0) g = 0;
                if(g > 255) g = 255;
                if(b < 0) b = 0;
                if(b > 255) b = 255;
                
                // goto
                widget.goto({ r: r, g: g, b: b });
                
            };
            
            // update hex
            widget.updatehex = function(){
                
                // get rgb
                var rgb = picker.hex2rgb($(stat4).val());
                
                // validate
                if(rgb != null){
                    widget.goto(rgb);
                }
                
            };
            
            // inputs
            $(stat1).on('change', function(e){
                widget.updatergb();
            });
            $(stat2).on('change', function(e){
                widget.updatergb();
            });
            $(stat3).on('change', function(e){
                widget.updatergb();
            });
            $(stat4).on('change', function(e){
                widget.updatehex();
            });
            
            // actions
            $(save).on('click', function(e){
                $(input).val('#' + $(stat4).val());
                $(widget).hide();
            });
            $(cancel).on('click', function(e){
                widget.goto(settings.color);
                $(widget).hide();
            });
            
            // click
            $(input).on('click', function(e){
                e.preventDefault();
                
                // get starting color
                var rgb = picker.hex2rgb($(this).val().substr(1));
                
                // validate
                if(rgb != null){
                    widget.goto(rgb);
                    $(color2).css('background-color', 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')');
                }
                else{
                    widget.goto(settings.color);
                    $(color2).css('background-color', 'rgb(' + settings.color.r + ', ' + settings.color.g + ', ' + settings.color.b + ')');
                }
                
                // show picker
                $(this).next('.ui-cp').show();
                
            });
            
            // unclick
            $(document).on('click', function(e){
                if($('.ui-cp:visible').size() > 0 && !$(e.target).is('.ui-cp-input,.ui-cp,.ui-cp *')){
                    $('.ui-cp:visible').hide();
                }
            });
            
        });
    };
})(jQuery);

// pick!
$('input[type=color]').picker();
