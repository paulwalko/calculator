function Calculate(){
		var form = document.getElementById("calculator");
		var total = form.elements["total"];
		var computer = parseInt(form.elements["computer"].value);
		var monitor = parseInt(form.elements["monitor"].value);
		var mouse = parseInt(form.elements["mouse"].value);
		var keyboard = parseInt(form.elements["keyboard"].value);
		var ram = parseInt(form.elements["ram"].value);
		var processor = parseInt(form.elements["processor"].value);
		total.value = ((400 * computer) + (150 * monitor) + (15 * mouse) + (10 * keyboard) + (50 * ram) + (175 * processor)).toFixed(2);
		Tax();
	}
	function Tax(){
		var form = document.getElementById("calculator");
		var total = parseInt(form.elements["total"].value);
		var tax = form.elements["tax"];
		tax.value = (total * .06).toFixed(2);
		Total();
	}
	function Total(){
		var form = document.getElementById("calculator");
		var total = parseInt(form.elements["total"].value);
		var sales = form.elements["sales"];
		sales.value = (total * 1.06).toFixed(2);
	}