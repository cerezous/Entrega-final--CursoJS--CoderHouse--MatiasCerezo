// Aca gestionaremos los productos que serán expuestos en la app

class GestionProductos {
    constructor() {
        this.productos = [];
        this.carrito = this.cargarCarritoDesdeStorage();
        this.productosFiltrados = [];
    }

    // Aquí iniciamos la gestión de productos
    iniciar() {
        this.cargarProductosDesdeJSON();
        this.setupEventListeners();
        this.actualizarContadorCarrito();
    }

    // Cargar productos desde el archivo JSON
    async cargarProductosDesdeJSON() {
        try {
            const response = await fetch('./js/db.json');
            const data = await response.json();
            
            // Combinar pizzas y bebidas, agregando un ID único basado en categoría
            const pizzasConIdUnico = data.menuPizzas.map(pizza => ({
                ...pizza,
                id_unico: `pizza_${pizza.id}`
            }));
            
            const bebidasConIdUnico = data.menuBebidas.map(bebida => ({
                ...bebida,
                id_unico: `bebida_${bebida.id}`
            }));
            
            this.productos = [...pizzasConIdUnico, ...bebidasConIdUnico];
            this.productosFiltrados = [...this.productos];
            
            // Mostrar productos
            this.mostrarProductos();
            
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.mostrarMensaje('Error al cargar los productos');
        }
    }

    // Cargar carrito desde localStorage
    cargarCarritoDesdeStorage() {
        try {
            const carritoGuardado = localStorage.getItem('carrito');
            return carritoGuardado ? JSON.parse(carritoGuardado) : [];
        } catch (error) {
            return [];
        }
    }

    // Guardar carrito en localStorage
    guardarCarritoEnStorage() {
        try {
            localStorage.setItem('carrito', JSON.stringify(this.carrito));
        } catch (error) {
            // Error al guardar carrito
        }
    }

    //Mostrar productos

    mostrarProductos() {
        const divProductos = document.querySelector('#productos') || this.crearContenedorProductos();
        divProductos.innerHTML = '';

        if (this.productosFiltrados.length === 0) {
            this.mostrarMensaje('No se encontraron productos');
            return;
        }

        this.productosFiltrados.forEach((producto) => {
            const productElement = this.crearTarjetaProducto(producto);
            divProductos.appendChild(productElement);
        });

        //Inicializar iconos en los productos
        if(typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    

    // Crear contenedor de productos si no existe (solo método de respaldo)
    crearContenedorProductos() {
        const contenedor = document.querySelector('#contenedor');
        const divProductos = document.createElement('div');
        divProductos.id = 'productos';
        divProductos.className = 'productos-container';
        contenedor.appendChild(divProductos);
        return divProductos;
    }

    //Crear tarjeta individual de cada producto

    crearTarjetaProducto(producto){
        const div= document.createElement('div');
        div.className= 'producto-card';
        div.setAttribute('data-id', producto.id_unico);
        div.setAttribute('data-categoria', producto.id_cat);

        const esPizza = producto.id_cat === 1;

        //Aquí añadimos una imagen referencial en caso de que la imagen del producto no cargue de forma correcta (línea 89)
        div.innerHTML = `
            <div class="producto-header">
                <div class="producto-content">
                    <h3 class="producto-nombre">${producto.nombre}</h3>
                    ${esPizza ? `<p class="producto-ingredientes">${producto.ingredientes.join(', ')}</p>` : ''}
                </div>
                <div class="producto-imagen-container">
                    <div class="producto-imagen">
                        <img src="${producto.img}" alt="${producto.nombre}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjVmNWY1Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TaW4gSW1hZ2VuPC90ZXh0Pgo8L3N2Zz4K'">
                    </div>
                </div>
            </div>
            <div class="producto-footer">
                <div class="producto-precio">$${producto.precio.toLocaleString()}</div>
                <button class="btn-agregar-minimal" onclick="gestionProductos.agregarAlCarrito('${producto.id_unico}')">
                    +
                </button>
            </div>
        `;
        return div;
    }   

    //--------------------- CREACIÓN Y FUNCIONES DEL CARRITO --------------------------

        // Agregar producto al carrito
    agregarAlCarrito(idProducto) {
        const producto = this.productos.find(p => p.id_unico === idProducto);
        
        if (!producto) {
            this.mostrarMensaje('Producto no encontrado', 'error');
            return;
        }

        if (producto.stock <= 0) {
            this.mostrarToast('Producto sin stock', 'error');
            return;
        }

        const itemExistente = this.carrito.find(item => item.id_unico === idProducto);
        
        if (itemExistente) {
            if (itemExistente.cantidad >= producto.stock) {
                this.mostrarToast('No hay más stock disponible', 'error');
                return;
            }
            itemExistente.cantidad++;
        } else {
            this.carrito.push({
                ...producto,
                cantidad: 1
            });
        }

                // Reducir stock
        producto.stock--;
        
        // Guardar en localStorage
        this.guardarCarritoEnStorage();
        
        this.actualizarContadorCarrito();
        Alertas.productoAgregado(producto.nombre);
    }

    // Remover producto del carrito
    removerDelCarrito(idProducto) {
        const itemIndex = this.carrito.findIndex(item => item.id_unico === idProducto);
        
        if (itemIndex === -1) return;

        const item = this.carrito[itemIndex];
        
        if (item.cantidad > 1) {
            item.cantidad--;
        } else {
            this.carrito.splice(itemIndex, 1);
        }

        // Restaurar stock
        const producto = this.productos.find(p => p.id_unico === idProducto);
        if (producto) {
            producto.stock++;
        }

        // Guardar en localStorage
        this.guardarCarritoEnStorage();
        
        this.actualizarContadorCarrito();
        
        // Si el carrito está vacío, cerrar el modal
        if (this.carrito.length === 0) {
            document.querySelector('.modal-carrito')?.remove();
        } else {
            // Actualizar el modal si está abierto
            this.actualizarModalCarrito();
        }
    }

    // Incrementar cantidad en el carrito
    incrementarCantidad(idProducto) {
        const item = this.carrito.find(item => item.id_unico === idProducto);
        const producto = this.productos.find(p => p.id_unico === idProducto);
        
        if (item && producto && producto.stock > 0) {
            item.cantidad++;
            producto.stock--;
            this.guardarCarritoEnStorage();
            this.actualizarContadorCarrito();
            this.actualizarModalCarrito();
        } else if (producto && producto.stock === 0) {
            this.mostrarToast('No hay stock disponible', 'error');
        }
    }

    // Buscar productos
    buscarProductos(termino) {
        if (!termino.trim()) {
            this.productosFiltrados = [...this.productos];
        } else {
            this.productosFiltrados = this.productos.filter(producto =>
                producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
                (producto.ingredientes && producto.ingredientes.some(ingrediente =>
                    ingrediente.toLowerCase().includes(termino.toLowerCase())
                ))
            );
        }
        this.mostrarProductos();
    }

    // Filtrar por categoría
    filtrarPorCategoria(idCategoria) {
        if (idCategoria === 0) {
            this.productosFiltrados = [...this.productos];
        } else {
            this.productosFiltrados = this.productos.filter(producto => 
                producto.id_cat === idCategoria
            );
        }
        this.mostrarProductos();
    }

    // Obtener total del carrito
    obtenerTotalCarrito() {
        return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    // Obtener cantidad total de items en el carrito
    obtenerCantidadCarrito() {
        return this.carrito.reduce((total, item) => total + item.cantidad, 0);
    }

    // Actualizar contador del carrito en el header
    actualizarContadorCarrito() {
        const contador = document.getElementById('cartCount');
        if (contador) {
            contador.textContent = this.obtenerCantidadCarrito();
        }
    }

    // Mostrar carrito
    mostrarCarrito() {
        if (this.carrito.length === 0) {
            Alertas.carritoVacio();
            return;
        }

        // Cerrar modal existente si hay uno
        document.querySelector('.modal-carrito')?.remove();
        
        const modal = this.crearModalCarrito();
        document.body.appendChild(modal);
        
        // Agregar event listeners para cerrar el modal
        this.agregarEventListenersModal(modal);
    }


    // Actualizar modal del carrito
    actualizarModalCarrito() {
        const modal = document.querySelector('.modal-carrito');
        if (modal) {
            const modalBody = modal.querySelector('.modal-body');
            const modalFooter = modal.querySelector('.modal-footer');
            
            if (modalBody) {
                modalBody.innerHTML = this.generarHTMLCarrito();
            }
            
            if (modalFooter) {
                modalFooter.innerHTML = `
                    <div class="total">Total: $${this.obtenerTotalCarrito().toLocaleString()}</div>
                    <button class="btn-finalizar" onclick="gestionProductos.finalizarCompra()">
                        <i data-lucide="credit-card"></i>
                        Finalizar Compra
                    </button>
                `;
            }
            
            // Reinicializar iconos
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    // Crear modal del carrito
    crearModalCarrito() {
        const modal = document.createElement('div');
        modal.className = 'modal-carrito';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i data-lucide="shopping-cart"></i> Mi Carrito</h2>
                    <button class="btn-cerrar" onclick="gestionProductos.cerrarModalCarrito()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${this.generarHTMLCarrito()}
                </div>
                <div class="modal-footer">
                    <div class="total">Total: $${this.obtenerTotalCarrito().toLocaleString()}</div>
                    <button class="btn-finalizar" onclick="gestionProductos.finalizarCompra()">
                        <i data-lucide="credit-card"></i>
                        Finalizar Compra
                    </button>
                </div>
            </div>
        `;
        // Inicializar iconos de Lucide en el modal
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
        
        return modal;
    }

    // HTML del carrito
    generarHTMLCarrito() {
        return this.carrito.map(item => `
            <div class="item-carrito">
                <div class="item-info">
                    <img src="${item.img}" alt="${item.nombre}" class="item-imagen">
                    <div class="item-details">
                        <h4>${item.nombre}</h4>
                        <p class="item-precio">$${item.precio.toLocaleString()}</p>
                        <p class="item-subtotal">Subtotal: $${(item.precio * item.cantidad).toLocaleString()}</p>
                    </div>
                </div>
                <div class="item-controls">
                    <button class="btn-remover" onclick="gestionProductos.removerDelCarrito('${item.id_unico}')" title="Quitar uno">
                        <i data-lucide="minus"></i>
                    </button>
                    <span class="cantidad">${item.cantidad}</span>
                    <button class="btn-incrementar" onclick="gestionProductos.incrementarCantidad('${item.id_unico}')" title="Agregar uno">
                        <i data-lucide="plus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    //---------------- DESDE AQUI COMENZAMOS A CREAR LA FINALIZACIÓN DE LA COMPRA ---------------------

    // Finalizar compra - Iniciar proceso de checkout
    finalizarCompra() {
        if (this.carrito.length === 0) {
            this.mostrarToast('El carrito está vacío', 'error');
            return;
        }

        this.mostrarOpcionesEntrega();
    }

    // Mostrar opciones de entrega
    mostrarOpcionesEntrega() {
        const modal = document.querySelector('.modal-carrito');
        if (!modal) return;

        const modalBody = modal.querySelector('.modal-body');
        const modalFooter = modal.querySelector('.modal-footer');
        
        modalBody.innerHTML = `
            <div class="checkout-step">
                <h3><i data-lucide="truck"></i> Opciones de Entrega</h3>
                <div class="opciones-entrega">
                    <div class="opcion-entrega" onclick="gestionProductos.seleccionarEntrega('delivery')">
                        <div class="opcion-icono">
                            <i data-lucide="truck"></i>
                        </div>
                        <div class="opcion-info">
                            <h4>Delivery</h4>
                            <p>Entrega a domicilio</p>
                            <span class="precio-entrega">+$2.000</span>
                        </div>
                    </div>
                    <div class="opcion-entrega" onclick="gestionProductos.seleccionarEntrega('retiro')">
                        <div class="opcion-icono">
                            <i data-lucide="store"></i>
                        </div>
                        <div class="opcion-info">
                            <h4>Retiro en Tienda</h4>
                            <p>Recoge tu pedido</p>
                            <span class="precio-entrega">Gratis</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modalFooter.innerHTML = `
            <button class="btn-volver" onclick="gestionProductos.volverAlCarrito()">
                <i data-lucide="arrow-left"></i>
                Volver al Carrito
            </button>
        `;

        // Inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Seleccionar tipo de entrega
    seleccionarEntrega(tipo) {
        this.tipoEntrega = tipo;
        this.mostrarFormularioPago();
    }

    // Mostrar formulario de pago
    mostrarFormularioPago() {
        const modal = document.querySelector('.modal-carrito');
        if (!modal) return;

        const modalBody = modal.querySelector('.modal-body');
        const modalFooter = modal.querySelector('.modal-footer');
        
        const costoEntrega = this.tipoEntrega === 'delivery' ? 2000 : 0;
        const total = this.obtenerTotalCarrito() + costoEntrega;
        
        modalBody.innerHTML = `
            <div class="checkout-step">
                <h3><i data-lucide="credit-card"></i> Datos de Pago</h3>
                <div class="resumen-pedido">
                    <h4>Resumen del Pedido</h4>
                    <div class="resumen-item">
                        <span>Subtotal:</span>
                        <span>$${this.obtenerTotalCarrito().toLocaleString()}</span>
                    </div>
                    <div class="resumen-item">
                        <span>Entrega (${this.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro'}):</span>
                        <span>${costoEntrega === 0 ? 'Gratis' : '$' + costoEntrega.toLocaleString()}</span>
                    </div>
                    <div class="resumen-total">
                        <span>Total:</span>
                        <span>$${total.toLocaleString()}</span>
                    </div>
                </div>
                <form id="formulario-pago" class="formulario-pago" autocomplete="off" onsubmit="gestionProductos.procesarPago(event)">
                    <div class="form-group">
                        <label for="nombre">Nombre Completo</label>
                        <input type="text" id="nombre" name="nombre" autocomplete="off" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" autocomplete="off" required>
                    </div>
                    <div class="form-group">
                        <label for="nombreTitular">Nombre del Titular de la Tarjeta</label>
                        <input type="text" id="nombreTitular" name="nombreTitular" autocomplete="off" required>
                    </div>
                    <div class="form-group">
                        <label for="telefono">Teléfono</label>
                        <input type="tel" id="telefono" name="telefono" autocomplete="off" required>
                    </div>
                    ${this.tipoEntrega === 'delivery' ? `
                    <div class="form-group">
                        <label for="direccion">Dirección de Entrega</label>
                        <input type="text" id="direccion" name="direccion" autocomplete="off" required>
                    </div>
                    ` : ''}
                    <div class="form-group">
                        <label for="numeroTarjeta">Número de Tarjeta</label>
                        <input type="text" id="numeroTarjeta" name="numeroTarjeta" maxlength="19" placeholder="4111 1111 1111 1111" autocomplete="off" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="fechaVencimiento">Vencimiento</label>
                            <input type="text" id="fechaVencimiento" name="fechaVencimiento" placeholder="12/25" autocomplete="off" required>
                        </div>
                        <div class="form-group">
                            <label for="cvv">CVV</label>
                            <input type="password" id="cvv" name="cvv" placeholder="123" autocomplete="off" required maxlength="3">
                        </div>
                    </div>
                </form>
            </div>
        `;

        modalFooter.innerHTML = `
            <button class="btn-volver" onclick="gestionProductos.mostrarOpcionesEntrega()">
                <i data-lucide="arrow-left"></i>
                Volver
            </button>
            <button class="btn-pagar" onclick="gestionProductos.procesarPago(event)">
                <i data-lucide="credit-card"></i>
                Ir a Pagar
            </button>
        `;

        // Inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Configurar formateo automático y validación manual
        this.setupFormWithObserver();
    }

    // Configurar formulario con observer para detectar cuando esté listo
    setupFormWithObserver() {
        const form = document.getElementById('formulario-pago');
        if (!form) {
            // Si el formulario no existe, lo va a reintentar en 100ms
            setTimeout(() => this.setupFormWithObserver(), 100);
            return;
        }

        // Aca usamos MutationObserver para detectar cuando se agreguen los campos
        const observer = new MutationObserver((mutations) => {
            const hasAllFields = this.checkAllFieldsExist();
            if (hasAllFields) {
                observer.disconnect();
                this.setupFieldFormatting();
                this.setupValidacion();
            }
        });

        observer.observe(form, {
            childList: true,
            subtree: true
        });

        // Fallback: configurar después de 1 segundo si el observer no detecta cambios
        setTimeout(() => {
            observer.disconnect();
            this.setupFieldFormatting();
            this.setupValidacion();
        }, 1000);
    }


    // Verificar que todos los campos existan
    checkAllFieldsExist() {
        const requiredFields = ['#nombre', '#email', '#telefono', '#direccion', '#nombreTitular', '#numeroTarjeta', '#fechaVencimiento', '#cvv'];
        return requiredFields.every(selector => document.querySelector(selector));
    }

    // Configurar formateo automático de campos
    setupFieldFormatting() {
        // Formateo de número de tarjeta
        const tarjetaInput = document.getElementById('numeroTarjeta');
        if (tarjetaInput) {
            tarjetaInput.addEventListener('input', (e) => {
                e.target.value = Validaciones.formatCardNumber(e.target.value);
                Validaciones.limpiarErrorCampo(e.target);
            });
        }

        // Formateo de fecha de vencimiento
        const fechaInput = document.getElementById('fechaVencimiento');
        if (fechaInput) {
            fechaInput.addEventListener('input', (e) => {
                e.target.value = Validaciones.formatExpirationDate(e.target.value);
                Validaciones.limpiarErrorCampo(e.target);
            });
        }

        // Formateo de CVV
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                e.target.value = Validaciones.formatCVV(e.target.value);
                Validaciones.limpiarErrorCampo(e.target);
            });
        }

        // Formateo de teléfono
        const telefonoInput = document.getElementById('telefono');
        if (telefonoInput) {
            telefonoInput.addEventListener('input', (e) => {
                e.target.value = Validaciones.formatPhone(e.target.value);
                Validaciones.limpiarErrorCampo(e.target);
            });
        }

        // Formateo de email
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                e.target.value = Validaciones.formatEmail(e.target.value);
                Validaciones.limpiarErrorCampo(e.target);
            });
        }

        // Agregar listeners para limpiar errores en todos los campos
        const todosLosCampos = ['nombre', 'email', 'telefono', 'nombreTitular', 'numeroTarjeta', 'fechaVencimiento', 'cvv', 'direccion'];
        todosLosCampos.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.addEventListener('input', (e) => {
                    Validaciones.limpiarErrorCampo(e.target);
                });
            }
        });
    }


    // Configurar event listener para el submit del formulario
    setupFormSubmitListener() {
        const form = document.getElementById('formulario-pago');
        if (!form) {
            setTimeout(() => this.setupFormSubmitListener(), 100);
            return;
        }

        // Agregar event listener para el submit
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.procesarPago(event);
        });
    }

    // Configurar Validacion
    setupValidacion() {
        // Verificar que el formulario y los campos existan
        const form = document.getElementById('formulario-pago');
        if (!form) {
            console.error('❌ Formulario no encontrado');
            return;
        }

        // Verificar que los campos requeridos existan
        const requiredFields = ['#nombre', '#email', '#telefono', '#nombreTitular', '#numeroTarjeta', '#fechaVencimiento', '#cvv'];
        const missingFields = requiredFields.filter(selector => !document.querySelector(selector));
        
        if (missingFields.length > 0) {
            console.error('❌ Campos faltantes:', missingFields);
            // Reintentar en 200ms
            setTimeout(() => this.setupValidacion(), 200);
            return;
        }

        // Destruir validador anterior si existe
        Validaciones.destroyValidator('pago');
        
        // Crear nuevo validador
        const validator = Validaciones.createPagoValidator('formulario-pago');
        
        if (!validator) {
            console.error('❌ Error al configurar JustValidate');
        } else {
            
            // Configurar callbacks para manejar el resultado de la validación
            validator.onSuccess((event) => {
                this.procesarPagoExitoso();
            });
            
            validator.onFail((fields) => {
                // JustValidate ya muestra los errores automáticamente
            });
        }
    }


    // Procesar pago cuando la validación es exitosa
    procesarPagoExitoso() {
        
        // Obtener datos del formulario
        const datosEntrega = this.obtenerDatosEntrega();
        const datosPago = this.obtenerDatosPago();
        
        // Simular procesamiento de pago
        this.mostrarProcesandoPago();
        
        setTimeout(() => {
            this.mostrarConfirmacionCompra();
        }, 2000);
    }

    // Procesar pago - Con validaciones desde Validaciones.js
    async procesarPago(event) {
        
        if (event) event.preventDefault();
        
        try {
            // Verificar que el formulario existe
            const form = document.getElementById('formulario-pago');
            
            if (!form) {
                console.error('❌ Formulario no encontrado');
                Alertas.error('Error', 'Formulario no encontrado. Por favor, recarga la página.');
                return;
            }

            
            // Limpiar errores anteriores usando Validaciones.js
            Validaciones.limpiarErrores();
            
            // Validar todos los campos usando Validaciones.js
            const esValido = Validaciones.validarFormularioCompleto();
            
            if (esValido) {
                this.procesarPagoExitoso();
            } else {
            }
            
        } catch (error) {
            console.error('❌ Error en procesarPago:', error);
            Alertas.error('Error', 'Hubo un problema al procesar el pago');
        }
    }


    // Mostrar procesando pago
    mostrarProcesandoPago() {
        const modal = document.querySelector('.modal-carrito');
        if (!modal) return;

        const modalBody = modal.querySelector('.modal-body');
        const modalFooter = modal.querySelector('.modal-footer');
        
        modalBody.innerHTML = `
            <div class="checkout-step procesando">
                <div class="procesando-animacion">
                    <i data-lucide="loader-2" class="spinner"></i>
                </div>
                <h3>Procesando Pago...</h3>
                <p>Por favor espera mientras procesamos tu pago</p>
            </div>
        `;

        modalFooter.innerHTML = '';

        // Inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Mostrar confirmación de compra
    mostrarConfirmacionCompra() {
        // Descontar stock de los productos comprados
        this.carrito.forEach(item => {
            const producto = this.productos.find(p => p.id_unico === item.id_unico);
            if (producto) {
                producto.stock -= item.cantidad;
                console.log(`${producto.nombre}: Stock reducido de ${producto.stock + item.cantidad} a ${producto.stock} (vendidas: ${item.cantidad})`);
            }
        });
        
        // Mostrar actualización del stock en consola
        console.log('Stock actualizado:');
        this.productos.forEach(producto => {
            console.log(`- ${producto.nombre}: ${producto.stock} unidades disponibles`);
        });
        
        const modal = document.querySelector('.modal-carrito');
        if (!modal) return;

        const modalBody = modal.querySelector('.modal-body');
        const modalFooter = modal.querySelector('.modal-footer');
        
        const costoEntrega = this.tipoEntrega === 'delivery' ? 2000 : 0;
        const total = this.obtenerTotalCarrito() + costoEntrega;
        
        modalBody.innerHTML = `
            <div class="checkout-step confirmacion">
                <div class="confirmacion-icono">
                    <i data-lucide="check-circle"></i>
                </div>
                <h3>¡Compra Finalizada!</h3>
                <p>Tu pedido ha sido procesado exitosamente</p>
                
                <div class="detalles-compra">
                    <h4>Detalles de la Compra</h4>
                    <div class="detalle-item">
                        <span>Nombre:</span>
                        <span></span>
                    </div>
                    <div class="detalle-item">
                        <span>Número de Pedido:</span>
                        <span>#${Math.floor(Math.random() * 10000) + 1000}</span>
                    </div>
                    <div class="detalle-item">
                        <span>Método de Entrega:</span>
                        <span>${this.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro en Tienda'}</span>
                    </div>
                    
                    <div class="productos-comprados">
                        <h4>Productos Comprados:</h4>
                        <div class="lista-productos">
                            ${this.carrito.map(item => `
                                <div class="producto-item">
                                    <div class="producto-info">
                                        <span class="producto-nombre">${item.nombre}</span>
                                        <span class="producto-cantidad">x${item.cantidad}</span>
                                    </div>
                                    <div class="producto-precio">
                                        <span>$${(item.precio * item.cantidad).toLocaleString()}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="resumen-total">
                        <div class="detalle-item">
                            <span>Subtotal:</span>
                            <span>$${this.obtenerTotalCarrito().toLocaleString()}</span>
                        </div>
                        ${costoEntrega > 0 ? `
                        <div class="detalle-item">
                            <span>Costo de Entrega:</span>
                            <span>$${costoEntrega.toLocaleString()}</span>
                        </div>
                        ` : ''}
                        <div class="detalle-item total-final">
                            <span><strong>Total Pagado:</strong></span>
                            <span><strong>$${total.toLocaleString()}</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modalFooter.innerHTML = `
            <button class="btn-finalizar-compra" onclick="gestionProductos.completarCompra()">
                <i data-lucide="home"></i>
                Finalizar
            </button>
        `;

        // Inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Completar compra
    completarCompra() {
        // Limpiar carrito
        this.carrito = [];
        this.guardarCarritoEnStorage();
        
        // Actualizar contador
        this.actualizarContadorCarrito();
        
        // Cerrar modal
        document.querySelector('.modal-carrito')?.remove();
        
        // Mostrar mensaje de éxito
        Alertas.success('¡Compra exitosa!', 'Tu pedido ha sido procesado correctamente');
        
        // Recargar productos para actualizar stock
        this.mostrarProductos();
        
        // Mostrar mensaje de carrito listo para nueva compra
        setTimeout(() => {
            Alertas.carritoListo();
        }, 3500); // Esperar a que termine el mensaje de éxito
    }

    // Detectar si estamos en el flujo de compra finalizada
    esModalCompraFinalizada() {
        const modal = document.querySelector('.modal-carrito');
        if (!modal) return false;
        
        // Solo limpiar carrito cuando estamos en la pantalla de confirmación final
        const confirmacion = modal.querySelector('.confirmacion');
        const procesando = modal.querySelector('.procesando');
        
        return !!(confirmacion || procesando);
    }

    // Cerrar modal del carrito (detecta automáticamente si es compra finalizada)
    cerrarModalCarrito() {
        if (this.esModalCompraFinalizada()) {
            // Si estamos en el flujo de compra finalizada, limpiar carrito
            this.cerrarModalCompraFinalizada();
        } else {
            // Si es el modal normal del carrito, solo cerrar
            document.querySelector('.modal-carrito')?.remove();
        }
    }

    // Cerrar modal de compra finalizada y limpiar carrito (solo para compra finalizada)
    cerrarModalCompraFinalizada() {
        // Limpiar carrito
        this.carrito = [];
        this.guardarCarritoEnStorage();
        
        // Actualizar contador
        this.actualizarContadorCarrito();
        
        // Cerrar modal
        document.querySelector('.modal-carrito')?.remove();
        
        // Recargar productos para actualizar stock
        this.mostrarProductos();
        
        // Mostrar mensaje de carrito listo para nueva compra
        Alertas.carritoListo();
    }

    // Volver al carrito
    volverAlCarrito() {
        const modal = document.querySelector('.modal-carrito');
        if (!modal) return;

        const modalBody = modal.querySelector('.modal-body');
        const modalFooter = modal.querySelector('.modal-footer');
        
        modalBody.innerHTML = this.generarHTMLCarrito();
        
        modalFooter.innerHTML = `
            <div class="total">Total: $${this.obtenerTotalCarrito().toLocaleString()}</div>
            <button class="btn-finalizar" onclick="gestionProductos.finalizarCompra()">
                <i data-lucide="credit-card"></i>
                Finalizar Compra
            </button>
        `;

        // Reinicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Event listener para búsqueda
        document.addEventListener('DOMContentLoaded', () => {
            const searchBtn = document.getElementById('searchBtn');
            if (searchBtn) {
                searchBtn.addEventListener('click', () => {
                    const termino = prompt('Buscar producto:');
                    if (termino !== null) {
                        this.buscarProductos(termino);
                    }
                });
            }
        });
    }

    // Mostrar mensaje cuando no hay productos
    mostrarMensaje(mensaje) {
        const divProductos = document.querySelector('#productos') || this.crearContenedorProductos();
        divProductos.innerHTML = `
            <div class="no-productos">
                <i data-lucide="search-x"></i>
                <p>${mensaje}</p>
            </div>
        `;
        
        // Inicializar iconos de Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Mostrar mensaje toast usando SweetAlert2
    mostrarToast(mensaje, tipo = 'info') {
        // Usar SweetAlert2 en lugar de toast personalizado
        switch(tipo) {
            case 'success':
                Alertas.success('¡Éxito!', mensaje);
                break;
            case 'error':
                Alertas.error('Error', mensaje);
                break;
            case 'warning':
                Alertas.warning('Advertencia', mensaje);
                break;
            default:
                Alertas.info('Información', mensaje);
        }
    }

    // Mostrar error
    mostrarError(mensaje) {
        this.mostrarToast(mensaje, 'error');
    }

    // Obtener datos de entrega del formulario
    obtenerDatosEntrega() {
        return {
            nombre: document.getElementById('nombre')?.value || '',
            email: document.getElementById('email')?.value || '',
            direccion: document.getElementById('direccion')?.value || '',
            telefono: document.getElementById('telefono')?.value || ''
        };
    }

    // Obtener datos de pago del formulario
    obtenerDatosPago() {
        return {
            nombreTitular: document.getElementById('nombreTitular')?.value || '',
            numeroTarjeta: document.getElementById('numeroTarjeta')?.value || '',
            fechaVencimiento: document.getElementById('fechaVencimiento')?.value || '',
            cvv: document.getElementById('cvv')?.value || ''
        };
    }

    // Obtener nombre de campo para mostrar
    getFieldDisplayName(fieldName) {
        const fieldNames = {
            'nombre': 'Nombre',
            'email': 'Email',
            'telefono': 'Teléfono',
            'nombreTitular': 'Nombre del Titular',
            'numeroTarjeta': 'Número de Tarjeta',
            'fechaVencimiento': 'Fecha de Vencimiento',
            'cvv': 'CVV'
        };
        return fieldNames[fieldName] || fieldName;
    }




    // Agregar event listeners para el modal del carrito
    agregarEventListenersModal(modal) {
        // Cerrar con ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                if (this.esModalCompraFinalizada()) {
                    this.cerrarModalCompraFinalizada();
                } else {
                    modal.remove();
                }
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Cerrar al hacer click fuera del modal
        const clickHandler = (e) => {
            if (e.target === modal) {
                if (this.esModalCompraFinalizada()) {
                    this.cerrarModalCompraFinalizada();
                } else {
                    modal.remove();
                }
                document.removeEventListener('keydown', escHandler);
            }
        };
        modal.addEventListener('click', clickHandler);

        // Limpiar event listeners cuando se remueve el modal
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.removedNodes.forEach((node) => {
                        if (node === modal) {
                            document.removeEventListener('keydown', escHandler);
                            document.removeEventListener('click', clickHandler);
                            observer.disconnect();
                        }
                    });
                }
            });
        });
        observer.observe(document.body, { childList: true });
    }
}

// Instancia global para acceso desde HTML
let gestionProductos = new GestionProductos();