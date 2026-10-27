# SIGI Free

Sistema de gestión de inventario y ventas desarrollado con Django, Tailwind CSS y Electron, diseñado para funcionar como una aplicación de escritorio en Windows.

## 🛠️ Requisitos previos

Para desarrollar y compilar el proyecto, necesitas:

- **Python 3.10 o superior:** [Descargar Python](https://www.python.org/downloads/)
- **Node.js y npm:** [Descargar Node.js](https://nodejs.org/)
- **Git:** [Descargar Git](https://git-scm.com/)

> Para generar el instalador de Windows, se recomienda realizar el proceso de compilación en Windows.

---

## 🚀 Instalación del entorno de desarrollo

### 1. Clonar el repositorio

```bash
git clone https://github.com/Galleto44/SIGI---Free.git
cd SIGI---Free
```

### 2. Crear el entorno virtual de Python

En Windows:

```powershell
python -m venv venv
```

### 3. Activar el entorno virtual

En PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

En CMD:

```cmd
venv\Scripts\activate.bat
```

### 4. Instalar las dependencias de Python

Desde la raíz del proyecto:

```bash
pip install -r requirements.txt
```

### 5. Instalar las dependencias de Tailwind CSS

Accede a la carpeta del frontend:

```bash
cd theme/static_src
```

Instala las dependencias registradas en `package-lock.json`:

```bash
npm ci
```

Genera los estilos CSS de producción:

```bash
npm run build
```

La compilación debe generar:

```text
theme/static/css/dist/styles.css
```

Regresa a la raíz del proyecto:

```bash
cd ../..
```

### 6. Instalar las dependencias de Electron

Desde la raíz del proyecto:

```bash
npm install
```

Este comando instala las dependencias de Node.js declaradas en el `package.json` de la aplicación de escritorio.

### 7. Configurar la base de datos

Crea las tablas necesarias en la base de datos SQLite local:

```bash
python manage.py migrate
```

### 8. Crear un usuario administrador

Si necesitas acceder al panel de administración de Django (`/admin`), crea un usuario local:

```bash
python manage.py createsuperuser
```

---

## 💻 Ejecutar el proyecto

### Aplicación de escritorio en desarrollo

Desde la raíz del proyecto, con el entorno virtual activado:

```bash
npm start
```

Electron iniciará el backend de Django y abrirá la aplicación en una ventana de escritorio.

La aplicación utiliza la dirección local:

```text
http://127.0.0.1:8000
```

### Ejecutar Django directamente en el navegador

Si deseas trabajar únicamente con el servidor de desarrollo de Django:

```bash
python manage.py runserver 127.0.0.1:8000
```

Abre `http://127.0.0.1:8000` en el navegador.

**Importante:** no ejecutes este servidor simultáneamente con `npm start`, ya que ambos intentarían utilizar el puerto `8000`.

### Compilar los estilos durante el desarrollo

Si necesitas recompilar los estilos automáticamente mientras trabajas en las plantillas, consulta la configuración de Tailwind incluida en el proyecto. Si utilizas `django-tailwind`, puedes ejecutar:

```bash
python manage.py tailwind start
```

---

## 📦 Generar el backend de Windows

SIGI Free utiliza PyInstaller para empaquetar el backend de Python. Se emplea el modo `--onedir` para distribuir el ejecutable junto con sus dependencias y mejorar el tiempo de arranque.

Desde la raíz del proyecto, con el entorno virtual activado, recopila los archivos estáticos:

```bash
python manage.py collectstatic --noinput
```

Genera el backend:

```powershell
python -m PyInstaller --noconfirm --clean --onedir --name SIGIBackend --add-data "templates;templates" --add-data "static;static" --add-data "staticfiles;staticfiles" --collect-all django --collect-all SIGI --collect-all products --collect-all sales --collect-all theme --collect-all tailwind --collect-all django_browser_reload run_backend.py
```

El resultado estará en:

```text
dist/
└── SIGIBackend/
    ├── SIGIBackend.exe
    └── ...
```

No elimines los archivos de soporte que acompañan al ejecutable: son necesarios para que el backend funcione.

---

## 🪟 Generar el instalador de Windows

Una vez generado el backend, crea el instalador de Electron:

```bash
npm run dist
```

El proceso utiliza `electron-builder` y la configuración de `package.json` para empaquetar la aplicación y sus recursos.

El instalador se genera en la carpeta:

```text
release/
```

Antes de generar el instalador, verifica que `package.json` incluya la carpeta completa `dist/SIGIBackend` como recurso adicional:

```json
"extraResources": [
  {
    "from": "dist/SIGIBackend",
    "to": "backend"
  }
]
```

La aplicación empaquetada debe buscar el backend en:

```text
resources/backend/SIGIBackend.exe
```

El instalador permite instalar SIGI Free en otros equipos Windows sin exigir que el usuario final instale Python ni configure manualmente el servidor de Django.

---

## 💾 Base de datos y almacenamiento local

SIGI Free utiliza SQLite para almacenar los datos localmente.

En la versión empaquetada, la ruta de datos configurada es:

```text
%APPDATA%\SIGI Free\db.sqlite3
```

La base de datos se mantiene fuera de la carpeta de instalación para preservar los datos del usuario durante las actualizaciones o reinstalaciones normales.

**Recomendaciones:**

- Realiza copias de seguridad periódicas de la base de datos.
- Cierra SIGI Free antes de copiar o restaurar el archivo SQLite.
- No elimines la carpeta de datos al desinstalar o actualizar la aplicación si deseas conservar la información.
- Antes de distribuir una actualización que modifique los modelos de Django, verifica las migraciones y la conservación de los datos existentes.

---

## 📂 Notas de desarrollo

- **Base de datos:** `db.sqlite3` está excluida del repositorio. Cada entorno de desarrollo utiliza su propia base de datos local.
- **Entorno virtual:** la carpeta `venv/` no debe subirse a Git.
- **Dependencias de Node.js:** `node_modules/` se genera mediante `npm install` o `npm ci`, según corresponda.
- **Tailwind CSS:** el CSS compilado se genera mediante `npm run build`.
- **PyInstaller:** las carpetas `build/` y `dist/` contienen archivos generados durante la compilación.
- **Electron:** la carpeta `release/` contiene los instaladores y artefactos de distribución.
- **Archivos estáticos:** `staticfiles/` contiene los archivos recopilados por Django.

Estas carpetas generadas están excluidas mediante `.gitignore`.

---

## 📄 Licencia

SIGI Free se distribuye bajo los términos de la **GNU General Public License v3.0 (GPL-3.0)**.

Consulta el archivo `LICENSE` incluido en el repositorio para conocer los términos completos de la licencia.

## 👨‍💻 Autor

**Johnny Enrique Velásquez Lezama**

Repositorio oficial: https://github.com/Galleto44/SIGI---Free
