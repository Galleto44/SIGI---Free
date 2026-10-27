
const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let djangoProcess = null;
let mainWindow = null;
let quitting = false;
let logFile = null;

const HOST = "127.0.0.1";
const PORT = 8000;
const URL = `http://${HOST}:${PORT}`;

function log(message) {
    const line = `[${new Date().toISOString()}] ${message}`;

    console.log(line);

    if (logFile) {
        try {
            fs.appendFileSync(logFile, line + "\n", "utf8");
        } catch (error) {
            console.error("No se pudo escribir el registro:", error);
        }
    }
}

function startDjango() {
    let executable;
    let args = [];
    let cwd;

    if (app.isPackaged) {
        executable = path.join(
            process.resourcesPath,
            "backend",
            "SIGIBackend.exe"
        );
        cwd = app.getPath("userData");
    } else {
        executable = process.platform === "win32"
            ? path.join(app.getAppPath(), "venv", "Scripts", "python.exe")
            : path.join(app.getAppPath(), "venv", "bin", "python");

        args = [path.join(app.getAppPath(), "run_backend.py")];
        cwd = app.getAppPath();
    }

    log(`Aplicación empaquetada: ${app.isPackaged}`);
    log(`Backend: ${executable}`);
    log(`Directorio de trabajo: ${cwd}`);
    log(`URL esperada: ${URL}`);

    if (!fs.existsSync(executable)) {
        log("ERROR: No existe el ejecutable del backend.");
        return false;
    }

    const env = {
        ...process.env
    };

    if (app.isPackaged) {
        env.SIGI_DATA_DIR = path.join(
            app.getPath("appData"),
            "SIGI Free"
        );
    }

    try {
        djangoProcess = spawn(executable, args, {
            cwd,
            stdio: ["ignore", "pipe", "pipe"],
            windowsHide: true,
            env
        });

        djangoProcess.stdout.on("data", (data) => {
            log(`BACKEND: ${data.toString().trimEnd()}`);
        });

        djangoProcess.stderr.on("data", (data) => {
            log(`BACKEND ERROR: ${data.toString().trimEnd()}`);
        });

        djangoProcess.on("error", (error) => {
            log(`ERROR AL INICIAR BACKEND: ${error.stack || error}`);
        });

        djangoProcess.on("exit", (code, signal) => {
            log(`Backend finalizado. Código: ${code}; señal: ${signal}`);

            djangoProcess = null;

            if (!quitting) {
                log("El backend terminó mientras Electron seguía activo.");
            }
        });

        return true;
    } catch (error) {
        log(`ERROR AL CREAR PROCESO: ${error.stack || error}`);
        return false;
    }
}

async function waitForDjango(maxAttempts = 240) {
    log("Esperando respuesta de Django...");

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (quitting) return false;

        try {
            const response = await fetch(URL);

            if (response.ok) {
                log(`Django respondió correctamente: HTTP ${response.status}`);
                return true;
            }

            log(`Django respondió con HTTP ${response.status}`);
        } catch (error) {
            if (attempt % 10 === 0) {
                log(`Intento ${attempt + 1}: Django todavía no responde.`);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    log("ERROR: Django no respondió dentro del tiempo límite.");
    return false;
}

async function createWindow() {
    log("Iniciando creación de la ventana.");

    const started = startDjango();

    if (!started) {
        log("No se pudo iniciar el backend. Cerrando aplicación.");
        app.quit();
        return;
    }

    const ready = await waitForDjango();

    if (!ready) {
        log("No se creará la ventana porque Django no está disponible.");
        app.quit();
        return;
    }

    try {
        mainWindow = new BrowserWindow({
            width: 1280,
            height: 800,
            minWidth: 1000,
            minHeight: 650,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        mainWindow.on("ready-to-show", () => {
            log("La ventana de Electron está lista para mostrarse.");
        });

        mainWindow.on("closed", () => {
            mainWindow = null;
            log("La ventana de Electron se cerró.");
        });

        log("Cargando la aplicación en Electron.");
        await mainWindow.loadURL(URL);
        log("La página se cargó correctamente.");
    } catch (error) {
        log(`ERROR AL CREAR O CARGAR LA VENTANA: ${error.stack || error}`);
        app.quit();
    }
}

app.whenReady().then(() => {
    logFile = path.join(app.getPath("userData"), "sigi-startup.log");
    log("========================================");
    log("Inicio de SIGI Free");
    log(`Versión: ${app.getVersion()}`);
    log(`Directorio de usuario: ${app.getPath("userData")}`);

    return createWindow();
}).catch((error) => {
    log(`ERROR GENERAL: ${error.stack || error}`);
    app.quit();
});

process.on("uncaughtException", (error) => {
    log(`EXCEPCIÓN NO CONTROLADA: ${error.stack || error}`);
});

process.on("unhandledRejection", (error) => {
    log(`PROMESA RECHAZADA: ${error?.stack || error}`);
});

app.on("before-quit", () => {
    quitting = true;
    log("Cerrando SIGI Free.");

    if (djangoProcess && !djangoProcess.killed) {
        djangoProcess.kill();
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
