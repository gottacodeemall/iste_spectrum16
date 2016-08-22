$(document).ready(function() {
  $('.nav').hover(
     function() {
    $(this).stop().animate(
    {
      left: '0',
      opacity:1
    },
    500,
    'easeInSine'
    );
   },
   function() {
     $(this).stop().animate(
    {
      left: '-225px',
      opacity:0.6
    },
    1500,
    'easeOutBounce'
    );
   }
  );


});
