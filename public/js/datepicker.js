$(document).ready(function () {
  $(function() {
    $('input[name="daterange"]').daterangepicker({
      opens: 'left',
      locale: {
        format: 'YYYY/MM/DD'
      }
    }, function(start, end, label) {
      console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    });
  });
});
