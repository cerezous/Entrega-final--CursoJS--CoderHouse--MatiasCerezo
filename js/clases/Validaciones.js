/* Acá se ocupo hacemos todas las validaciones para finalizar la compra y se asocian a GestionProductos.js
    - Considerar que solo es una simulación por ende no verifica N° de tarjeta si es real o no aunque el navegador de por si (Google Chrome) muestra el siguiente mensaje en Nombre del titular de la tarjeta y N° de Tarjeta:
        "La opción de autocompletado de los métodos de pago está inhabilitada porque este formulario no utiliza una conexión segura."*/

class Validaciones {
    constructor() {
        this.validators = new Map();
        this.init();
    }

    init(){
        this.configStyles();
    }

    //Aquí configuramos los estilos para las validaciones

    configStyles(){
        if(document.getElementById('validation_styles'))
            return;

        const style = document.createElement('style')
        style.id = 'validation_styles';
        style.textContent = `
        
            .just-validate-error-label{
                color: #dc2626 !important; 
                margin-top: 0.25rem !important; 
                display: block !important; 
                font-size: 0.875rem !important;
            }

            .just-validate-success-label {
                color: #16a34a !important; 
                margin-top: 0.25rem !important; 
                display: block !important; 
                font-size: 0.875rem !important;
            }

            .just-validate-error-field{
                border: 1px solid #dc2626 !important;
                background-color: transparent !important;
            }
            
            .just-validate-success-field {
                border: 1px solid #16a34a !important;
            }

           .validation-summary {
                background-color: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 0.5rem;
                padding: 1rem;
                margin-bottom: 1rem;
            }
            
            .validation-summary h4 {
                color: #dc2626;
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
            }

            .validation-summary ul {
                margin: 0;
                padding-left: 1rem;
            }
            
            .validation-summary li {
                color: #dc2626;
                margin-bottom: 0.25rem;
            }

            .error-field{
                border: 1px solid #dc2626 !important;
                background-color: transparent !important;
            }
            
            .error-message {
                color: #dc2626 !important;
                font-size: 0.875rem !important;
                margin-top: 0.25rem !important;
                display: block !important;
            }

            /* Estilos específicos para el formulario de pago */
            .formulario-pago .form-group {
                position: relative;
                margin-bottom: 1rem;
            }

            .formulario-pago .just-validate-error-label {
                position: absolute;
                bottom: -20px;
                left: 0;
                right: 0;
                background: white;
                padding: 2px 0;
                z-index: 1000;
            }

            .formulario-pago .form-group:has(.just-validate-error-field) {
                margin-bottom: 2rem;
            }
            
        `;
        document.head.appendChild(style);
    }

    //Validador para el formulario de pago (Acá hacemos doble validación: 1. Just Validate válida la información en tiempo real - 2. Validación manual: La valida antes de procesar el pago)

    static createPagoValidator(formId){
        const form = document.getElementById(formId);

        if (!form) {
            console.error('❌ Formulario no encontrado:', formId);
            return null;
        }


        // Verificar que los campos existen antes de crear el validador
        const requiredFields = ['#nombre', '#email', '#telefono', '#nombreTitular', '#numeroTarjeta', '#fechaVencimiento', '#cvv'];
        const missingFields = requiredFields.filter(selector => !document.querySelector(selector));
        
        
        if (missingFields.length > 0) {
            console.error('❌ Campos que faltan para validar:', missingFields);
            return null;
        }


        const validator = new window.JustValidate(form, {
            errorFieldCssClass: 'just-validate-error-field',
            errorLabelCssClass: 'just-validate-error-label',
            successFieldCssClass: 'just-validate-success-field',
            successLabelCssClass: 'just-validate-success-label',
            focusInvalidField: true,
            lockForm: true,
            errorLabelStyle: {
                color: '#dc2626',
                fontSize: '0.875rem',
                marginTop: '0.25rem',
                display: 'block',
                fontWeight: '500'
            }
        });

        // Configurar validaciones

        validator
            .addField('#nombre', [
                {
                    rule: 'required',
                    errorMessage: 'El nombre es obligatorio'
                },
                {
                    rule: 'minLength',
                    value: 2,
                    errorMessage: 'El nombre debe tener al menos 2 caracteres'
                },
                {
                    rule: 'maxLength',
                    value: 50,
                    errorMessage: 'El nombre no puede exceder 50 caracteres'
                },
                {
                    rule: 'customRegexp',
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                    errorMessage: 'El nombre solo puede contener letras'
                }
            ])
                        .addField('#email', [
                {
                    rule: 'required',
                    errorMessage: 'El email es obligatorio'
                },
                {
                    rule: 'email',
                    errorMessage: 'Formato de email inválido'
                }
            ])
            .addField('#telefono', [
                {
                    rule: 'required',
                    errorMessage: 'El teléfono es obligatorio'
                },
                {
                    rule: 'customRegexp',
                    value: /^\d{8}$/,
                    errorMessage: 'El teléfono debe tener exactamente 8 dígitos'
                }
            ])
            .addField('#nombreTitular', [
                {
                    rule: 'required',
                    errorMessage: 'El nombre del titular es obligatorio'
                },
                {
                    rule: 'minLength',
                    value: 2,
                    errorMessage: 'El nombre debe tener al menos 2 caracteres'
                },
                {
                    rule: 'maxLength',
                    value: 50,
                    errorMessage: 'El nombre no puede exceder 50 caracteres'
                },
                {
                    rule: 'customRegexp',
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                    errorMessage: 'El nombre solo puede contener letras'
                }
            ])
            .addField('#numeroTarjeta', [
                {
                    rule: 'required',
                    errorMessage: 'El número de tarjeta es obligatorio'
                },
                {
                    rule: 'customRegexp',
                    value: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/,
                    errorMessage: 'Formato de tarjeta inválido (1234 5678 9012 3456)'
                }
            ])
            .addField('#fechaVencimiento', [
                {
                    rule: 'required',
                    errorMessage: 'La fecha de vencimiento es obligatoria'
                },
                {
                    rule: 'customRegexp',
                    value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                    errorMessage: 'Formato debe ser MM/YY'
                }
            ])
            .addField('#cvv', [
                {
                    rule: 'required',
                    errorMessage: 'El CVV es obligatorio'
                },
                {
                    rule: 'customRegexp',
                    value: /^\d{3,4}$/,
                    errorMessage: 'El CVV debe tener entre 3 y 4 dígitos'
                }
            ])
            .onSuccess((event) => {
                // La validación fue exitosa
            })
            .onFail((fields) => {
                // Las validación falló
            });
        
        validationHelper.validators.set('pago', validator);
        return validator;
    }

    //Validación del formulario completo:
    static validarFormularioCompleto() {
        let esValido = true;
        
        // Validar nombre
        if (!Validaciones.validarNombre()) esValido = false;
        
        // Validar email
        if (!Validaciones.validarEmail()) esValido = false;
        
        // Validar teléfono
        if (!Validaciones.validarTelefono()) esValido = false;
        
        // Validar nombre titular
        if (!Validaciones.validarNombreTitular()) esValido = false;
        
        // Validar número de tarjeta
        if (!Validaciones.validarNumeroTarjeta()) esValido = false;
        
        // Validar fecha vencimiento
        if (!Validaciones.validarFechaVencimiento()) esValido = false;
        
        // Validar CVV
        if (!Validaciones.validarCVV()) esValido = false;
        
        // Validar dirección si es delivery
        const tipoEntrega = window.gestionProductos?.tipoEntrega;
        if (tipoEntrega === 'delivery' && !Validaciones.validarDireccion()) esValido = false;
        
        return esValido;
    }

    // Validar nombre
    static validarNombre() {
        const campo = document.getElementById('nombre');
        const valor = campo.value.trim();
        
        if (!valor) {
            Validaciones.mostrarError(campo, 'El nombre es obligatorio');
            return false;
        }
        
        if (valor.length < 2) {
            Validaciones.mostrarError(campo, 'El nombre debe tener al menos 2 caracteres');
            return false;
        }
        
        if (valor.length > 50) {
            Validaciones.mostrarError(campo, 'El nombre no puede exceder 50 caracteres');
            return false;
        }
        
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
            Validaciones.mostrarError(campo, 'El nombre solo puede contener letras');
            return false;
        }
        
        return true;
    }

    // Validar email
    static validarEmail() {
        const campo = document.getElementById('email');
        const valor = campo.value.trim();
        
        if (!valor) {
            Validaciones.mostrarError(campo, 'El email es obligatorio');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valor)) {
            Validaciones.mostrarError(campo, 'Formato de email inválido');
            return false;
        }
        
        return true;
    }

    // Validar teléfono
    static validarTelefono() {
        const campo = document.getElementById('telefono');
        const valor = campo.value.trim();
        
        if (!valor) {
            Validaciones.mostrarError(campo, 'El teléfono es obligatorio');
            return false;
        }
        
        if (!/^\d{8}$/.test(valor)) {
            Validaciones.mostrarError(campo, 'El teléfono debe tener exactamente 8 dígitos');
            return false;
        }
        
        return true;
    }

    // Validar nombre titular
    static validarNombreTitular() {
        const campo = document.getElementById('nombreTitular');
        const valor = campo.value.trim();
        
        if (!valor) {
            Validaciones.mostrarError(campo, 'El nombre del titular es obligatorio');
            return false;
        }
        
        if (valor.length < 2) {
            Validaciones.mostrarError(campo, 'El nombre debe tener al menos 2 caracteres');
            return false;
        }
        
        if (valor.length > 50) {
            Validaciones.mostrarError(campo, 'El nombre no puede exceder 50 caracteres');
            return false;
        }
        
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
            Validaciones.mostrarError(campo, 'El nombre solo puede contener letras');
            return false;
        }
        
        return true;
    }

    // Validar número de tarjeta
    static validarNumeroTarjeta() {
        const campo = document.getElementById('numeroTarjeta');
        const valor = campo.value.trim();
        
        if (!valor) {
            Validaciones.mostrarError(campo, 'El número de tarjeta es obligatorio');
            return false;
        }
        
        // Formato: 1234 5678 9012 3456
        if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(valor)) {
            Validaciones.mostrarError(campo, 'Formato de tarjeta inválido (1234 5678 9012 3456)');
            return false;
        }
        
        return true;
    }

    // Validar fecha vencimiento
    static validarFechaVencimiento() {
        const campo = document.getElementById('fechaVencimiento');
        const valor = campo.value.trim();
        
        if (!valor) {
            Validaciones.mostrarError(campo, 'La fecha de vencimiento es obligatoria');
            return false;
        }
        
        // Formato: MM/YY
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(valor)) {
            Validaciones.mostrarError(campo, 'Formato debe ser MM/YY');
            return false;
        }
        
        return true;
    }

    // Validar CVV
    static validarCVV() {
        const campo = document.getElementById('cvv');
        const valor = campo.value.trim();
        
        if (!valor) {
            Validaciones.mostrarError(campo, 'El CVV es obligatorio');
            return false;
        }
        
        if (!/^\d{3,4}$/.test(valor)) {
            Validaciones.mostrarError(campo, 'El CVV debe tener entre 3 y 4 dígitos');
            return false;
        }
        
        return true;
    }

    // Validar dirección (solo para delivery)
    static validarDireccion() {
        const campo = document.getElementById('direccion');
        const valor = campo.value.trim();
        
        if (!valor) {
            Validaciones.mostrarError(campo, 'La dirección es obligatoria para delivery');
            return false;
        }
        
        if (valor.length < 10) {
            Validaciones.mostrarError(campo, 'La dirección debe tener al menos 10 caracteres');
            return false;
        }
        
        return true;
    }

    // Mostrar error en un campo
    static mostrarError(campo, mensaje) {
        
        // Agregar clase de error al campo
        campo.classList.add('error-field');
        
        // Crear mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        
        // Insertar después del campo
        campo.parentNode.insertBefore(errorDiv, campo.nextSibling);
        
        // Enfocar el campo
        campo.focus();
        
        // Scroll al campo con error
        campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Limpiar errores anteriores
    static limpiarErrores() {
        
        // Remover mensajes de error existentes (sin animación)
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.remove();
        });
        
        // Remover clases de error de los campos
        document.querySelectorAll('.error-field').forEach(field => {
            field.classList.remove('error-field');
        });
        
    }

    // Limpiar error de un campo específico
    static limpiarErrorCampo(campo) {
        // Remover clase de error
        campo.classList.remove('error-field');
        
        // Remover mensaje de error (sin animación)
        const errorMessage = campo.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }


    //Formatear número de tarjeta
    static formatCardNumber(value) {
        const numbers = value.replace(/\D/g, '').substring(0, 16);
        return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
    }

    //Formatear fecha de vencimiento
    static formatExpirationDate(value) {
        const numbers = value.replace(/\D/g, '').substring(0, 4);
        if (numbers.length >= 2) {
            return numbers.replace(/(\d{2})(\d{0,2})/, '$1/$2');
        }
        return numbers;
    }

    //Formatear CVV
    static formatCVV(value) {
        return value.replace(/\D/g, '').substring(0, 4);
    }

    //Formatear teléfono
    static formatPhone(value) {
        return value.replace(/\D/g, '').substring(0, 8);
    }

    //Formatear email
    static formatEmail(value) {
        return value.toLowerCase().trim();
    }

    //Obtener validador por tipo
    static getValidator(type) {
        return validationHelper.validators.get(type);
    }

    //Destruir validador
    static destroyValidator(type) {
        const validator = validationHelper.validators.get(type);
        if (validator) {
            validator.destroy();
            validationHelper.validators.delete(type);
        }
    }
}

// Instancia global para compatibilidad
const validationHelper = new Validaciones();