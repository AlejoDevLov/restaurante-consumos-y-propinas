let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

const categorias = {
    1: 'Comida',
    2: 'Bebida',
    3: 'Postre'
}


const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    // Revisar si está vacío
    const camposVacios = [ mesa, hora ].some( campo => campo === '');
    if ( camposVacios ){
        // verificar si hay una alerta
        const existeAlerta = document.querySelector('.invalid-feedback');

        if( !existeAlerta ) {
            const formModal = document.querySelector('.modal-body form');
            mostrarAlerta('Todos los campos son obligatorios', formModal );
        }
        return;
    } 
    
    // Asignar datos del formulario
    cliente = { ...cliente, mesa, hora };

    // cerrar modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    // Mostrar secciones
    mostrarSeccion();

    // Obtener platillos
    obtenerPlatillos();
}

function mostrarAlerta(mensaje, nodoPadre){
    const alerta = document.createElement('div');
    alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
    alerta.textContent = mensaje;
    nodoPadre.appendChild(alerta);
    setTimeout( () => {
        alerta.remove();
    }, 3000);
}

function mostrarSeccion() {
    const secciones = document.querySelectorAll('.d-none');
    secciones.forEach( seccion => seccion.classList.remove('d-none'));
}

function obtenerPlatillos() {
    // const url = 'http://localhost:3000/platillos';
    const url = './db.json';
    fetch(url)
        .then( resp => resp.json())
        .then( result => mostrarPlatillo(result.platillos) )
        .catch( err => console.log(err))
}

function mostrarPlatillo(platillos) {
    const contenido = document.querySelector('#platillos .contenido');
    
    platillos.forEach( platillo => {
        const { nombre, precio, categoria, id } = platillo;

        const row = document.createElement('div');
        row.classList.add('row', 'py-3', 'border-top');

        const nombreDiv = document.createElement('div');
        nombreDiv.classList.add('col-md-4');
        nombreDiv.textContent = nombre;

        const precioDiv = document.createElement('div');
        precioDiv.classList.add('col-md-3', 'fw-bold');
        precioDiv.textContent = precio.toLocaleString('en-US', { style: 'currency', currency:'USD', minimumFractionDigits: 2 });

        const categoriaDiv = document.createElement('div');
        categoriaDiv.classList.add('col-md-3');
        categoriaDiv.textContent = categorias[categoria];

        const inputCantidad = document.createElement('input');
        inputCantidad.type = "number";
        inputCantidad.id = `platillo-${ id }`;
        inputCantidad.min = 0;
        inputCantidad.value = 0;

        // agregar evento que indique la cantidad y el producto agregado
        inputCantidad.onchange = () => {
            const cantidad = parseInt(inputCantidad.value);
            agregarPlatillo({ ...platillo, cantidad });
        }

        const divInput = document.createElement('div');
        divInput.classList.add('col-md-2');
        divInput.appendChild(inputCantidad);

        row.appendChild(nombreDiv);
        row.appendChild(precioDiv);
        row.appendChild(categoriaDiv);
        row.appendChild(divInput);

        contenido.appendChild(row);
    })
}

function agregarPlatillo(platillo) {
    let { pedido } = cliente;

    // Revisar que la cantidad sea mayor a cero
    if ( platillo.cantidad > 0 ){
        
        // Comprueba si el elemento ya existe en el array
        if ( pedido.some( articulo => articulo.id === platillo.id ) ){

            // Actualizar la cantidad en el array
            const pedidoActualizado = pedido.map( articulo => {
                if ( articulo.id === platillo.id ){
                    articulo.cantidad = platillo.cantidad;
                }
                return articulo;
            })
            
            // agregamos al carrito
            cliente.pedido = [...pedidoActualizado];

        } else {
            // si el articulo no existe en el array, lo agregamos
            cliente.pedido = [...pedido, platillo];
        }

    } else {
        // eliminar articulos con cantidad 0
        const nuevoPedido = pedido.filter( producto => producto.id !== platillo.id);
        cliente.pedido = [...nuevoPedido];
    }

    // Actualizar resumen del pedido
    actualizarResumen();

    // limpiar contenido si no hay productos
    if( cliente.pedido.length === 0 ) mensajePedidoVacio();
}

function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido');

    // Limpiar contenido de contenido
    limpiarHtml();

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6' );

    const cardResumen = document.createElement('DIV');
    cardResumen.classList.add('card', 'shadow', 'py-5', 'px-3')

    // Informacion de la mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    // Informacion de la hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    // Agregar a los elementos padre
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    // Titulo de la seccion
    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Platillos consumidos';

    // Iterar sobre el array de pedidos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const { pedido } = cliente;
    pedido.forEach( articulo => {
        const { nombre, id, precio, cantidad } = articulo;

        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        // Nombre producto
        const nombreProducto = document.createElement('H4');
        nombreProducto.classList.add('my-4');
        nombreProducto.textContent = nombre;

        // Cantidad producto
        const cantidadProducto = document.createElement('P');
        cantidadProducto.classList.add('fw-bold');
        cantidadProducto.innerHTML = `Cantidad: <span class="fw-normal">${cantidad}</span>`;
        
        // Precio producto
        const precioProducto = document.createElement('P');
        precioProducto.classList.add('fw-bold');
        const precioFormatoDolar = precio.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
        precioProducto.innerHTML = `Precio: <span class="fw-normal">${precioFormatoDolar}</span>`;

        // Subtotal pedido
        const subtotal = document.createElement('P');
        subtotal.classList.add('fw-bold');
        const subtotalFormatoDolar = calcularSubtotal(precio, cantidad);
        subtotal.innerHTML = `Subtotal: <span class="fw-normal">${subtotalFormatoDolar}</span>`;

        // Boton eliminar producto
        const botonEliminar = document.createElement('BUTTON');
        botonEliminar.classList.add('btn', 'btn-danger');
        botonEliminar.textContent = 'Eliminar producto';
        botonEliminar.onclick = function(){
            eliminarProducto(id);
        } 

        // Agregar elemento al LI
        lista.appendChild(nombreProducto);
        lista.appendChild(cantidadProducto);
        lista.appendChild(precioProducto);
        lista.appendChild(subtotal);
        lista.appendChild(botonEliminar);

        // Agregar LI a UL
        grupo.appendChild(lista);
    })

    // Agregar al contenido
    cardResumen.appendChild(heading);
    cardResumen.appendChild(mesa);
    cardResumen.appendChild(hora);
    cardResumen.appendChild(grupo);

    resumen.appendChild(cardResumen);

    contenido.appendChild(resumen);

    // Crear formulario de propinas
    formularioPropinas();
}

function limpiarHtml() {
    const contenido = document.querySelector('#resumen .contenido');

    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad){
    const subtotal = cantidad * precio;
    const subtotalFormateado = subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
    return subtotalFormateado;
}

function eliminarProducto(id) {
    const nuevoPedido = cliente.pedido.filter( producto => producto.id !== id );
    cliente.pedido = [...nuevoPedido];

    if(cliente.pedido.length){
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    // resetear input a 0 cuando se elimine el producto
    const idProductoEliminado = `#platillo-${id}`;
    const inputEliminado = document.querySelector(idProductoEliminado);
    inputEliminado.value = 0;
}

function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');

    limpiarHtml();

    const mensaje = document.createElement('P');
    mensaje.classList.add('text-center');
    mensaje.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(mensaje);
}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('formulario', 'col-md-6');

    const cardFormulario = document.createElement('DIV');
    cardFormulario.classList.add('card', 'shadow', 'py-5', 'px-3')

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propinas';

    // Radio button 10%
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('LABEL');
    radio10Label.classList.add('form-check-label');
    radio10Label.textContent = '10%';

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    // Radio button 25%
    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('LABEL');
    radio25Label.classList.add('form-check-label');
    radio25Label.textContent = '25%';

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    // Radio button 50%
    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('LABEL');
    radio50Label.classList.add('form-check-label');
    radio50Label.textContent = '50%';

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);


    cardFormulario.appendChild(heading);
    cardFormulario.appendChild(radio10Div);
    cardFormulario.appendChild(radio25Div);
    cardFormulario.appendChild(radio50Div);

    formulario.appendChild(cardFormulario);

    contenido.appendChild(formulario);
}

function calcularPropina(e) {
    const { pedido } = cliente;
    let subtotal = 0;

    pedido.forEach( articulo => {
        subtotal += (articulo.precio * articulo.cantidad );
    })

    const propina = subtotal * ( Number(e.target.value)/100 );
    const total = subtotal + propina;

    mostrarTotal( total, subtotal, propina );
}

function mostrarTotal( total, subtotal, propina ) {

    const divTotalesHtml = document.querySelector('.total-pagar');

    if( divTotalesHtml ) {
        divTotalesHtml.remove();
    }


    // Div totales
    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar', 'mt-5');

    // Subtotal
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    subtotalParrafo.textContent = 'Subtotal consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = subtotal.toLocaleString('en-US', { style:'currency', currency:'USD', minimumFractionDigits:2 });

    subtotalParrafo.appendChild(subtotalSpan);

    divTotales.appendChild(subtotalParrafo);

    // Propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = propina.toLocaleString('en-US', { style:'currency', currency:'USD', minimumFractionDigits:2 });

    propinaParrafo.appendChild(propinaSpan);

    // Total
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    totalParrafo.textContent = 'Total a pagar: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = total.toLocaleString('en-US', { style:'currency', currency:'USD', minimumFractionDigits:2 });

    totalParrafo.appendChild(totalSpan);

    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formularioDiv = document.querySelector('.formulario > div');
    formularioDiv.appendChild(divTotales);
}