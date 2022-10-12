// RECUPERAR DATOS DEL LOCAL STORAGE AL CARRITO DE COMPRA
let carrito = JSON.parse(localStorage.getItem("Carro")) || {}; // REDUCCION DE UNA CONDICIONAL 

//DOM
const btnCarro = document.querySelector('#carroCompra');
const card = document.querySelector('#tarjeta');
const formCompra = document.querySelector('#form-compra');
const tempCard = document.querySelector('#template-card').content;
const tempCarrito = document.getElementById('template-carrito').content;
const tempCarritoFooter = document.getElementById('template-carrito-footer').content;
const tempCompra = document.getElementById('terminar-compra').content;
const items = document.getElementById('items-carro');
const footerItem = document.getElementById('footer');
const footerModal = document.getElementById('carrito-vacio');

// CONTADOR CANTIDAD DE PRODUCTOS EN BTN CARRO
let contador = 0;
Object.values(carrito).forEach(function (contar) {
    contador += contar.cantidad;
});

let baseDatos = [];

// TRAER PRODUCTOS DEL ARCHIVO .JSON
const DataJson = async () => {
    const res = await fetch('data.json')
    baseDatos = await res.json()      
    render(baseDatos)
}

// FUNCION TRAE LOS PRODUCTOS Y LOS VISUALIZA
DataJson()

// NUMERO DE PRODUCTOS EN EL BTN CARRO DE COMPRA
contador === 0 ? btnCarro.querySelector('span').textContent = "" : btnCarro.querySelector('span').textContent = contador // OPERADOR TERNARIO

//FUNCION QUE GENERA LA VISUALIZACION DE LOS PRODUCTOS
function render(baseDatos) {
    card.innerHTML = ""
    baseDatos.forEach((baseDatos) => {
        tempCard.querySelector('img').setAttribute("src", baseDatos.imgUrl);
        tempCard.querySelector('.card-title').textContent = baseDatos.titulo;
        tempCard.querySelector('.card-text').textContent = baseDatos.precio;
        tempCard.querySelector('.btn-warning').dataset.id = baseDatos.id;
        const clone = tempCard.cloneNode(true);
        card.appendChild(clone);        
    });   
};

//BOTONES FILTROS ARRAY
const btnFiltro1 = document.querySelector('#option1') 
btnFiltro1.addEventListener('click', () => {
    render(baseDatos);
});

const btnFiltro2 = document.querySelector('#option2') 
btnFiltro2.addEventListener('click', () => {
    const resultado1 = baseDatos.filter((el) => el.titulo.includes('Aeropuerto'));
    render(resultado1);
});

const btnFiltro3 = document.querySelector('#option3') 
btnFiltro3.addEventListener('click', () => {
    const resultado2 = baseDatos.filter((el) => el.titulo.includes('Tour'));
    render(resultado2);
});

//PRESIONAR BTN CARRO DE COMPRA EN MENU SUPERIOR
btnCarro.addEventListener('click', () => {
    renderCarrito();
    renderFooter();
});

//PRESIONAR BTN COMPRAR EN DIV DE LAS CARD
card.addEventListener('click', e => {
    addCarrito(e);
});

//BOTON MAS Y MENOS DENTRO DEL CARRO DE COMPRA
items.addEventListener('click', e => {
    btnCantidad(e);
})

// BTN TERMINAR COMPRA EN CARRITO DE COMPRA 
const btnTerminar = document.querySelector('#Terminar-Compra')
btnTerminar.addEventListener('click', () => {
    TerminarCompra();
})

// ID DEL BTN COMPRAR DE LAS CARD
const addCarrito = e => {    
    e.target.classList.contains('btn-warning') && setCarrito(e.target.parentElement); // REDUCCION DE UNA CONDICIONAL   
};

// CREACION DE LOS ITEM DEL CARRITO
const setCarrito = item => {
    const prodCarro = {
        id: item.querySelector('.btn-warning').dataset.id,
        titulo: item.querySelector('.card-title').textContent,
        precio: item.querySelector('.card-text').textContent,
        cantidad: 1
    }
    if (carrito.hasOwnProperty(prodCarro.id)) { // SI EXISTE EL PRODUCTO EN EL CARRITO SE SUMA 1
        prodCarro.cantidad = carrito[prodCarro.id].cantidad + 1
    }
    carrito[prodCarro.id] = { ...prodCarro }; // SPREAD DE ARRAY   
    renderCarrito();
}

// VISUALIZAR ELEMENTOS EN EL CARRITO 
const renderCarrito = () => {
    items.innerHTML = ''
    Object.values(carrito).forEach(prodCarro => {
        tempCarrito.querySelector('th').textContent = prodCarro.id
        tempCarrito.querySelectorAll('td')[0].textContent = prodCarro.titulo
        tempCarrito.querySelectorAll('td')[1].textContent = prodCarro.cantidad
        tempCarrito.querySelector('.btn-secondary').dataset.id = prodCarro.id
        tempCarrito.querySelector('.btn-warning').dataset.id = prodCarro.id
        tempCarrito.querySelector('span').textContent = prodCarro.precio * prodCarro.cantidad
        const clone = tempCarrito.cloneNode(true)
        items.appendChild(clone)        
    })
    renderFooter();
    guardaLocal();
}

// VISUALIZAR TOTALES DEL CARRITO DE COMPRA
const renderFooter = () => {
    footerItem.innerHTML = "";
    if (Object.keys(carrito).length === 0) {
        footerItem.innerHTML = `<th class="text-center display-4" scope="row" colspan="5">Carrito vacío</th>`
        btnCarro.querySelector('span').textContent = "";
        return
    }

    // sumar cantidad y sumar totales
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc, { cantidad, precio }) => acc + cantidad * precio, 0)

    btnCarro.querySelector('span').textContent = nCantidad

    tempCarritoFooter.querySelectorAll('td')[0].textContent = nCantidad
    tempCarritoFooter.querySelector('span').textContent = nPrecio

    const clone = tempCarritoFooter.cloneNode(true)
    
    footerItem.appendChild(clone)

    //BTN VACIAR CARRITO
    const boton = document.querySelector('#vaciar-carrito')
    boton.addEventListener('click', () => {
        carrito = {};
        renderCarrito();
        guardaLocal();
        btnCarro.querySelector('span').textContent = "";
        formCompra.innerHTML = '';
    })

};

//AUMENTAR Y DESMINUIR CANTIDAD
const btnCantidad = e => {
    if (e.target.classList.contains('btn-warning')) {
        const prodCarro = carrito[e.target.dataset.id]
        prodCarro.cantidad = carrito[e.target.dataset.id].cantidad + 1
        carrito[e.target.dataset.id] = { ...prodCarro } // SPREAD DE ARRAY        
        renderCarrito()
    }

    if (e.target.classList.contains('btn-secondary')) {
        const prodCarro = carrito[e.target.dataset.id]
        prodCarro.cantidad = carrito[e.target.dataset.id].cantidad - 1
        
        prodCarro.cantidad === 0 && delete carrito[e.target.dataset.id], formCompra.innerHTML = ''; // REDUCCION DE UNA CONDICIONAL

        renderCarrito()
    }
}

//FORMULARIO FINALIZAR COMPRA
function TerminarCompra() {
    formCompra.innerHTML = '';
    if (Object.keys(carrito).length != 0) {
        const clone = tempCompra.cloneNode(true);        
        formCompra.appendChild(clone);        
    }
};

// Bootstrap, deshabilitar el envío de formularios si hay campos no válidos
(function () {
    'use strict';
    window.addEventListener('load', function () {
        // Obtener todos los formularios a los que queremos aplicar estilos de validación de Bootstrap personalizados
        const forms = document.getElementsByClassName('needs-validation');
        // Bucle sobre ellos y evitar el envio
        const validation = Array.prototype.filter.call(forms, function (form) {              
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');               

                if (form.checkValidity() === true) {
                    const nombre = document.querySelector('#validationCustom01').value
                    const apellido = document.querySelector('#validationCustom02').value
                    const mail = document.querySelector('#validationCustom06').value
                    
                    // USO DE LA LIBRERIA SWEETALERT2
                    Swal.fire({
                    title: nombre + ' ' + apellido + ' el pago fue procesado',
                    text:  'El comprobante de pago sera enviado a: ' + mail ,
                    icon: 'success',                    
                    confirmButtonText: 'Cerrar',                    
                    })  

                    carrito = {};
                    renderCarrito();
                    guardaLocal();
                    btnCarro.querySelector('span').textContent = "";
                    formCompra.innerHTML = '';
                }
            }, false);
        });
    }, false);
})();

// JSON Local Storage
function guardaLocal() {
    localStorage.setItem("Carro", JSON.stringify(carrito))
}






