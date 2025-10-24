// Aqui manejaremos todos los tipos de alertas de la libreria SweetAlert2 y los importaremos en GestiónProductos.js

class Alertas {

    //Mensajes para éxito
    static success (title, text = '') {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: text,
            timer:3000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }

    //Mensajes de error
    static error (title, text = '') {
        return Swal.fire({
            icon: 'error',
            title: title,
            text: text,
            timer:3000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        }); 
    }

    // Mensaje para información
    static info (title, text = '') {
        return Swal.fire({
            icon: 'info',
            title: title,
            text: text,
            timer:4000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }

    // Mensaje de advertencia
    static warning (title, text = '') {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: text,
            timer:4000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }

    static sinResultados () {
        return Swal.fire({
            icon: 'info',
            title: 'Sin resultados',
            text: 'No se encontro el producto',
            timer:3000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }

    // Mensaje de producto agregado al carrito
    static productoAgregado(nombreProducto) {
        return Swal.fire({
            icon: 'success',
            title: '¡Agregado!',
            text: `${nombreProducto} agregada al carrito`,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }

    // Mensaje de carrito vacío
    static carritoVacio() {
        return Swal.fire({
            icon: 'info',
            title: 'Carrito vacío',
            text: 'No hay productos en tu carrito',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }

    // Mensaje de carrito listo para nueva compra
    static carritoListo() {
        return Swal.fire({
            icon: 'success',
            title: '¡Carrito listo!',
            text: 'Carrito listo para otra compra',
            timer: 4000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }
}