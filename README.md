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

### 5. Configurar Tailwind CSS
Instala las dependencias de Node.js necesarias para el diseño:
```bash
python manage.py tailwind install
```
*Nota: Si estás en Mac/Linux y el comando falla, asegúrate de que `NPM_BIN_PATH` en `settings.py` apunte a `"npm"` en lugar de `"npm.cmd"`.*

### 6. Configurar la Base de Datos
Crea la estructura de la base de datos local (SQLite):
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

Para ver el proyecto en funcionamiento con compilación de estilos en tiempo real:

```bash
python manage.py tailwind start
```

El servidor estará disponible en: [http://127.0.0](http://127.0.0)

---

## 📂 Notas de Desarrollo
*   **Base de datos**: El archivo `db.sqlite3` está excluido del repositorio. Cada desarrollador tendrá sus propios datos locales.
*   **Tailwind**: No es necesario subir la carpeta `node_modules`. El comando `tailwind install` la generará cuando sea necesario.
