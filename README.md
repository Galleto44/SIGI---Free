# SIGI Project

Este es un proyecto desarrollado con Django y Tailwind CSS. Sigue estos pasos para configurar tu entorno local de desarrollo.

## 🛠️ Requisitos Previos

Asegúrate de tener instalados los siguientes componentes:

*   **Python 3.10+**: [Descargar](https://python.org)
*   **Node.js & npm**: [Descargar](https://nodejs.org) (Requerido para Tailwind)
*   **Git**: [Descargar](https://git-scm.com)

---

## 🚀 Instalación Paso a Paso

### 1. Clonar el proyecto
```bash
git clone https://github.com
cd SIGI
```

### 2. Configurar el Entorno Virtual
Crea un entorno aislado para evitar conflictos de dependencias:
```bash
# Windows
python -m venv venv

# macOS/Linux
python3 -m venv venv
```

### 3. Activar el Entorno Virtual
```bash
# Windows
venv\(\Scripts\activate\)

# macOS/Linux
source venv/bin/activate
```

### 4. Instalar Dependencias de Python
```bash
pip install -r requirements.txt
```

### 5. Instalar y compilar Tailwind CSS

```bash
Entra en la carpeta donde se encuentra el package.json de Tailwind:

cd theme/static_src

Instala las dependencias registradas en package-lock.json:

npm ci

Este comando instala las dependencias del frontend declaradas en package.json, incluidas Tailwind CSS, DaisyUI y @fontsource/inter, siempre que estén registradas correctamente en el archivo de bloqueo.

A continuación, genera el CSS de producción:

npm run build

La compilación debe generar este archivo:

theme/static/css/dist/styles.css

Después de la compilación, regresa a la raíz del proyecto:

cd ../..
```
### 6. Configurar la Base de Datos. Crea la estructura de la base de datos local (SQLite):
```bash
python manage.py migrate
```

### 7. Crear Usuario Administrador
Para acceder al panel de administración (`/admin`), crea tu cuenta local:
```bash
python manage.py createsuperuser
```

---

## 💻 Ejecución del Proyecto

```bash
python.exe .\manage.py runserver
```

Para ver el proyecto en funcionamiento con compilación de estilos en tiempo real:

```bash
python manage.py tailwind start
```

El servidor estará disponible en: [http://127.0.0](http://127.0.0)

---

## 📂 Notas de Desarrollo
*   **Base de datos**: El archivo `db.sqlite3` está excluido del repositorio. Cada desarrollador tendrá sus propios datos locales.
*   **Tailwind**: No es necesario subir la carpeta `node_modules`. El comando `tailwind install` la generará cuando sea necesario.
