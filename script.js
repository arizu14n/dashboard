//creo una lista selecionando todos los elementos li del div navegacion
let lista = document.querySelectorAll('.navegacion li'); 
// creo una función para establecer cual de todos los items es el link activo
function LinkActivo(){ 
    //a cada item de la lista le quito la clase hovered, si la tuviera
    lista.forEach((item) =>
    item.classList.remove('hovered'));
 // al elemento activo le asigno la clase hovered
    this.classList.add('hovered');
}
// a cada elemento de la lista de navegación que pase por encima con el mouse le asigno la condición de link activo
lista.forEach((item) =>
item.addEventListener('mouseover', LinkActivo));



// Toggle

let onOff = document.querySelector('.toggle');
let navegacion = document.querySelector('.navegacion');
let principal = document.querySelector('.principal');

onOff.onclick =function(){
    navegacion.classList.toggle('active')
    principal.classList.toggle('active')
}