# Documentación Técnica: Backend de Facturación Electrónica

Este componente del sistema es responsable de la generación, firmado y emisión de Comprobantes Fiscales Electrónicos (e-CF) en cumplimiento con las normativas de la Dirección General de Impuestos Internos (DGII) de la República Dominicana.

## 1. Cumplimiento Normativo (DGII)

El sistema implementa estrictamente las especificaciones técnicas establecidas por la DGII para la emisión de e-CF.

*   **Estándar de Firma**: XML Digital Signature (XML-DSig).
*   **Tipo de Firma**: Enveloped Signature (La firma digital se encuentra incrustada dentro del mismo documento XML).
*   **Normativa**: Cumple con los requisitos de la Norma General 06-2018 y la documentación técnica de e-CF vigente.

## 2. Mecanismo de Firma Digital

El proceso de firma NO requiere conversión a PDF ni formatos intermedios. Se firma directamente la estructura de datos XML para garantizar la integridad de la información fiscal.

### Especificaciones Criptográficas Implementadas:

| Componente | Especificación | URI Estándar |
|------------|----------------|--------------|
| **Algoritmo de Firma** | RSA-SHA256 | `http://www.w3.org/2001/04/xmldsig-more#rsa-sha256` |
| **Algoritmo de Digest** | SHA256 | `http://www.w3.org/2001/04/xmlenc#sha256` |
| **Canonicalización** | C14N (Inclusive) | `http://www.w3.org/TR/2001/REC-xml-c14n-20010315` |
| **Transformaciones** | Enveloped Signature | `http://www.w3.org/2000/09/xmldsig#enveloped-signature` |

### Flujo de Datos:

1.  **Construcción (`xmlService`)**: Se genera el XML crudo (`<eCF>`) a partir de los datos de la factura.
2.  **Firma (`signatureService`)**:
    *   Se calcula el *hash* (Digest) de la estructura XML usando SHA256.
    *   Se cifra dicho hash usando la llave privada del certificado (.p12) y el algoritmo RSA.
    *   Se inserta el nodo `<Signature>` dentro del XML original.
3.  **Resultado**: Un archivo XML válido y firmado digitalmente, listo para envío a la DGII.

## 3. Requisitos para Producción

Para que el firmado sea válido ante la DGII, es indispensable configurar el sistema con un Certificado Digital apropiado:

*   **Tipo de Certificado**: Certificado Cualificado para Procedimientos Tributarios.
*   **Emisores Autorizados**: Entidades acreditadas por INDOTEL (ej. Avansi, Cámara de Comercio de Santo Domingo).
*   **Formato de Archivo**: PKCS#12 (`.p12` o `.pfx`).

## 4. Configuración del Proyecto

Ruta del certificado y credenciales deben configurarse en el archivo `.env`:

```env
# Configuración de Certificado
CERTIFICATE_PATH=rute/al/certificado.p12
CERTIFICATE_PASSWORD=tu_contraseña_segura

# Base de Datos
DB_HOST=localhost
DB_USER=...
DB_NAME=...
```

## 5. Ejecución

```bash
# Instalación de dependencias
npm install

# Modo Desarrollo
npm run dev
```
