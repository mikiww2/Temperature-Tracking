(function ($) {
 "use strict";
	
	$(document).ready(function() {
		 $('#data-table-basic').DataTable({
		 	"paging": false,
		 	"language": {
			    "decimal":        "",
			    "emptyTable":     "Nessun elemento disponibile",
			    "info":           "Da _START_ a _END_ di _TOTAL_ elementi",
			    "infoEmpty":      "Da 0 a 0 di 0 elementi",
			    "infoFiltered":   "(filtrati da _MAX_ elementi totali)",
			    "infoPostFix":    "",
			    "thousands":      ",",
			    "lengthMenu":     "Mostra _MENU_ elementi",
			    "loadingRecords": "Caricamento...",
			    "processing":     "Renderizzazione...",
			    "search":         "Cerca:",
			    "zeroRecords":    "Nessun elemento corrispondente",
			    "paginate": {
			        "first":      "Prima",
			        "last":       "Ultima",
			        "next":       "Prossima",
			        "previous":   "Precedente"
			    },
			    "aria": {
			        "sortAscending":  ": activate to sort column ascending",
			        "sortDescending": ": activate to sort column descending"
    			}
			}
		 });
	});
 
})(jQuery); 