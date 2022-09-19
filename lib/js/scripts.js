// ----------------------------------------------------------------------------
// ultraviolet.js
// ----------------------------------------------------------------------------
$(window).on('resize', resize_ultraviolet_bg);
resize_ultraviolet_bg();

function resize_ultraviolet_bg() {
  $('#ultraviolet_bg').height($(window).height());
}

$(ultraviolet_handle);
function ultraviolet_handle(){
  let canvas = $('#ultraviolet_bg');

  $('#ultraviolet').ultravioletBackground({
    trails: parseInt(canvas.attr('data-trails')? canvas.attr('data-trails'): '20'),

    fixedHue: canvas.attr('data-fixedhue') == 'false',
    hueSpeed: parseFloat(canvas.attr('data-huespeed')? canvas.attr('data-huespeed') : '0.003'),

    hue: parseInt(canvas.attr('data-hue') ? canvas.attr('data-hue') : '90'),
    saturation:parseInt(canvas.attr('data-saturation')? canvas.attr('data-saturation'): '90') + '%',
    lightness:parseInt(canvas.attr('data-lightness')? canvas.attr('data-lightness'): '70') + '%',
    opacity: parseFloat(canvas.attr('data-opacity')? canvas.attr('data-opacity'): '0.3'),

    trailsCompositeOperation: 'darken',// 白地背景時 : darken, 黒字背景字 : lighter

    bgR: parseInt(canvas.attr('data-bgr') ? canvas.attr('data-bgr') : '255'),
    bgG: parseInt(canvas.attr('data-bgg') ? canvas.attr('data-bgg') : '255'),
    bgB: parseInt(canvas.attr('data-bgb') ? canvas.attr('data-bgb') : '255')
  });
}
