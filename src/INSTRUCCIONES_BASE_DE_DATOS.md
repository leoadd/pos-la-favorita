# 📦 Base de Datos Local - La Favorita POS

## ✅ ¿Qué es LocalStorage?

LocalStorage es una **base de datos local del navegador** que guarda los datos directamente en tu computadora. Los datos persisten incluso cuando:
- Cierras el navegador
- Apagas la computadora
- Reinicias el sistema

## 🎯 Características

### ✅ Ventajas
- **100% Local**: Los datos NUNCA salen de tu máquina
- **Sin Internet**: Funciona completamente offline
- **Persistente**: Los datos se mantienen entre sesiones
- **Automático**: Se guarda automáticamente cada cambio
- **Gratis**: No requiere servidores ni suscripciones

### ⚠️ Limitaciones
- **Por Navegador**: Los datos están en Chrome, no en Firefox (usa un solo navegador)
- **Límite de Espacio**: Aproximadamente 5-10 MB (miles de productos y ventas)
- **Limpieza**: Si borras el caché del navegador, pierdes los datos

## 🔧 Cómo Usar

### 1. Primer Uso
Al abrir la aplicación por primera vez, se cargan automáticamente:
- 6 productos de ejemplo
- 2 usuarios (admin y empleado1)
- 0 ventas

### 2. Uso Normal
- **Agrega productos**: Se guardan automáticamente
- **Registra ventas**: Se guardan automáticamente
- **Crea usuarios**: Se guardan automáticamente
- Todo se sincroniza en tiempo real con LocalStorage

### 3. Backup (Respaldo)
**Ir a Configuración → Exportar Datos**
- Descarga un archivo JSON con todos tus datos
- Guárdalo en un lugar seguro (USB, nube, etc.)
- Fecha recomendada: Diario o semanal

### 4. Restaurar Backup
**Ir a Configuración → Importar Datos**
- Selecciona el archivo JSON de backup
- Los datos se restauran automáticamente
- Recarga la página para ver los cambios

### 5. Resetear Sistema
**Ir a Configuración → Resetear Base de Datos**
- ⚠️ PELIGRO: Borra TODO
- Restaura los datos de ejemplo
- Úsalo solo para empezar de cero

## 📊 Estadísticas

En el módulo de **Configuración** puedes ver:
- Cantidad de productos registrados
- Total de ventas realizadas
- Número de usuarios
- Ingresos totales acumulados

## 🚀 Desplegar en tu Máquina

### Opción 1: Usar en el navegador (actual)
Ya está funcionando en Figma Make

### Opción 2: Descargar como aplicación web
1. Descarga todos los archivos del proyecto
2. Abre `index.html` en tu navegador
3. Los datos se guardan en LocalStorage de tu navegador

### Opción 3: Crear acceso directo
1. Guarda la URL de Figma Make en favoritos
2. Crea un acceso directo en el escritorio
3. Usa siempre el mismo navegador

## 💡 Recomendaciones

### ✅ Mejores Prácticas
1. **Usa un solo navegador** (Chrome recomendado)
2. **NO borres el caché** del navegador
3. **Haz backups semanales** de tus datos
4. **Guarda los backups** en USB o nube
5. **Prueba la restauración** de backups periódicamente

### ⚠️ Advertencias
- No uses modo incógnito (no guarda datos)
- No uses varios navegadores (datos separados)
- No limpies el caché sin hacer backup
- No confíes solo en LocalStorage, haz backups

## 🔍 Solución de Problemas

### ❓ "Perdí mis datos"
- Ve a Configuración → Importar Datos
- Carga tu último backup
- Recarga la página

### ❓ "No se guardan los cambios"
- Verifica que no estés en modo incógnito
- Revisa que tu navegador permita LocalStorage
- Haz Ctrl+F5 para recargar

### ❓ "Quiero usar en otra computadora"
- Exporta los datos (backup)
- Copia el archivo JSON a la otra PC
- Importa los datos en la nueva computadora

### ❓ "Alcancé el límite de espacio"
- Exporta un backup
- Resetea la base de datos
- Mantén solo datos recientes
- Considera migrar a una BD real (MySQL, PostgreSQL)

## 📱 Para Producción Real

Si necesitas usar esto en producción con múltiples dispositivos:

### Opción A: Base de Datos Real
- MySQL o PostgreSQL local
- Requiere servidor backend (Node.js, PHP, Python)
- Sincronización entre dispositivos

### Opción B: Base de Datos en la Nube
- Supabase (gratis hasta cierto límite)
- Firebase
- Sincronización automática entre dispositivos

---

## 🎓 Resumen

**LocalStorage es perfecto para:**
- ✅ Pruebas y desarrollo
- ✅ Un solo punto de venta
- ✅ Uso personal
- ✅ Sin necesidad de internet

**NO uses LocalStorage para:**
- ❌ Múltiples sucursales
- ❌ Datos críticos sin backup
- ❌ Sincronización entre dispositivos
- ❌ Grandes volúmenes de datos

---

**¿Necesitas ayuda?** Consulta el módulo de Configuración dentro de la aplicación.
