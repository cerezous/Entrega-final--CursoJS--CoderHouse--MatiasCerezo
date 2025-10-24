//App modular para la pizzeria

class PizzeriaApp {
    constructor() {
        this.init();
    }

    init() {
        this.createHeader();
        this.setupEventListeners();
    }

    createHeader() {
        const header = document.createElement('header');
        header.className ='main-header';
        header.innerHTML = `

        <div class="header-container">
            <div class="logo">
                <img src="img/logo/logocerezospizza.png" alt="Cerezo's Pizza Logo">
            </div>
            <div class="header-filters">
                <button class="filter-btn active" id="filterAll" data-category="0">
                    <i data-lucide="grid-3x3"></i>
                    <span>Todos</span>
                </button>
                <button class="filter-btn" id="filterPizza" data-category="1">
                    <i data-lucide="pizza"></i>
                    <span>Pizzas</span>
                </button>
                <button class="filter-btn" id="filterBebidas" data-category="2">
                    <i data-lucide="droplet"></i>
                    <span>Bebidas</span>
                </button>
            </div>
            <div class="header-actions">
                <button class="search-btn" id="searchBtn">
                    <i data-lucide="search"></i>
                </button>
                <button class="cart-btn" id="cartBtn">
                    <i data-lucide="shopping-cart"></i>
                    <span class="cart-count" id="cartCount">0</span>
                </button>
            </div>
        </div>
        `;
        
        //Aca insertamos el header al inicio del body
        document.body.insertBefore(header, document.body.firstChild);

        //Aquí iniciamos los iconos de la librería Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    //Setting addEventListener de los botones

    setupEventListeners() {

        // Event listener para el botón de búsqueda
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.handleSearch();
        });

        // Event listener para el botón del carrito
        document.getElementById('cartBtn').addEventListener('click', () => {
            this.handleCart();
        });

        // Event listeners para los filtros
        document.getElementById('filterAll').addEventListener('click', () => {
            this.handleFilter(0);
        });

        document.getElementById('filterPizza').addEventListener('click', () => {
            this.handleFilter(1);
        });

        document.getElementById('filterBebidas').addEventListener('click', () => {
            this.handleFilter(2);
        });
    }

    //Búsqueda en el tool tip
    handleSearch() {
        this.mostrarTooltipBusqueda();
    }

    mostrarTooltipBusqueda() {
        // Crear el tooltip de búsqueda
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-busqueda';
        tooltip.innerHTML = `
            <div class="tooltip-busqueda-header">
                <h3>
                    <i data-lucide="search"></i>
                    Buscar Productos
                </h3>
                <button class="btn-cerrar-busqueda" id="cerrarBusqueda">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="busqueda-input-container">
                <input type="text" class="busqueda-input" id="busquedaInput" placeholder="Escribe el nombre del producto...">
            </div>
            <div class="busqueda-resultados" id="busquedaResultados">
                <div class="sin-resultados">
                    <i data-lucide="search"></i>
                    <p>Escribe para buscar productos</p>
                </div>
            </div>
        `;

        document.body.appendChild(tooltip);

        // Inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Event listeners
        const input = document.getElementById('busquedaInput');
        const resultados = document.getElementById('busquedaResultados');
        const cerrarBtn = document.getElementById('cerrarBusqueda');

        // Enfocar el input
        input.focus();

        // Búsqueda en tiempo real
        input.addEventListener('input', (e) => {
            const termino = e.target.value.trim();
            this.buscarProductos(termino, resultados);
        });

        // Cerrar tooltip
        cerrarBtn.addEventListener('click', () => {
            this.cerrarTooltipBusqueda(tooltip);
        });

        // Cerrar con ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.cerrarTooltipBusqueda(tooltip);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Cerrar al hacer click fuera del tooltip
        const clickHandler = (e) => {
            if (!tooltip.contains(e.target) && !e.target.closest('.search-btn')) {
                this.cerrarTooltipBusqueda(tooltip);
                document.removeEventListener('click', clickHandler);
            }
        };
        setTimeout(() => document.addEventListener('click', clickHandler), 100);
    }

    buscarProductos(termino, contenedorResultados) {
        if(!termino) {
            contenedorResultados.innerHTML = `
                <div class="sin-resultados">
                    <i data-lucide="search"></i>
                    <p>Escribe para buscar productos</p>
                </div>           
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;           
        }
        // Obtener todos los productos de la gestión
        let productos = [];
        if (gestionProductos && gestionProductos.productos) {
            productos = gestionProductos.productos;
        }

        // Filtrar productos
        const resultados = productos.filter(producto => 
            producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            (producto.ingredientes && producto.ingredientes.some(ing => 
                ing.toLowerCase().includes(termino.toLowerCase())
            ))
        );

        if (resultados.length === 0) {
            contenedorResultados.innerHTML = `
                <div class="sin-resultados">
                    <i data-lucide="search-x"></i>
                    <p>No se encontraron productos</p>
                </div>
            `;
            // Mostrar mensaje con SweetAlert2
            Alertas.sinResultados();
        } else {
            contenedorResultados.innerHTML = resultados.map(producto => `
                <div class="resultado-item" data-producto-id="${producto.id_unico}">
                    <img src="${producto.img}" alt="${producto.nombre}" class="resultado-imagen" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEgzMFYzMEgyMFYyMFoiIGZpbGw9IiNDQ0MiLz4KPC9zdmc+'" />
                    <div class="resultado-info">
                        <div class="resultado-nombre">${producto.nombre}</div>
                        <div class="resultado-precio">$${producto.precio}</div>
                        <div class="resultado-categoria">${producto.id_cat === 1 ? 'Pizza' : 'Bebida'}</div>
                    </div>
                </div>
            `).join('');

            // Agregar event listeners a los resultados
            contenedorResultados.querySelectorAll('.resultado-item').forEach(item => {
                item.addEventListener('click', () => {
                    const productoId = item.dataset.productoId;
                    this.navegarAProducto(productoId);
                    this.cerrarTooltipBusqueda(document.querySelector('.tooltip-busqueda'));
                });
            });
        }

        // Reinicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    navegarAProducto(productoId) {
        if (gestionProductos) {
            // Buscar el producto específico por id_unico
            const producto = gestionProductos.productos.find(p => p.id_unico === productoId);
            if (producto) {
                // Filtrar para mostrar SOLO el producto seleccionado
                gestionProductos.productosFiltrados = [producto];
                
                // Limpiar todos los filtros activos del header
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Forzar la actualización de la vista
                gestionProductos.mostrarProductos();
                
                // Scroll al producto
                setTimeout(() => {
                    const elementoProducto = document.querySelector(`[data-id="${productoId}"]`);
                    if (elementoProducto) {
                        elementoProducto.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                        
                        // Destacar el producto brevemente
                        elementoProducto.style.transform = 'scale(1.05)';
                        elementoProducto.style.boxShadow = '0 8px 25px rgba(211, 47, 47, 0.3)';
                        elementoProducto.style.transition = 'all 0.3s ease';
                        
                        setTimeout(() => {
                            elementoProducto.style.transform = 'scale(1)';
                            elementoProducto.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }, 2000);
                    }
                }, 100);
                
                // Mostrar mensaje de que se está mostrando solo un producto
                this.mostrarMensajeProductoSeleccionado(producto.nombre);
            }
        }
    }

    mostrarMensajeProductoSeleccionado(nombreProducto) {
        // Usar SweetAlert2 para mostrar el mensaje
        Alertas.productoSeleccionado(nombreProducto);
    }

    cerrarTooltipBusqueda(tooltip) {
        if (tooltip && tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
        
        // NO limpiar filtros aquí - mantener el producto seleccionado
        // Solo cerrar el tooltip
    }

    handleCart() {
        if (gestionProductos) {
            gestionProductos.mostrarCarrito();
        }
    }

    handleFilter(categoryId) {
        // Remover clase active de todos los botones
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Agregar clase active al botón seleccionado
        const activeButton = document.querySelector(`[data-category="${categoryId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Aplicar filtro en la gestión de productos
        if (gestionProductos) {
            gestionProductos.filtrarPorCategoria(categoryId);
        }
        
        // Limpiar cualquier mensaje de SweetAlert2
        Swal.close();
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PizzeriaApp();
    
    // Inicializar gestión de productos
    if (typeof gestionProductos !== 'undefined') {
        gestionProductos.iniciar();
    }
});
    
    

    



