const DB_NAME = "BAE_DATABASE";
const DB_VERSION = 1;
const STORE_NAME = "registros";

let db;

function abrirBanco() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject("Erro ao abrir banco.");
        };

        request.onsuccess = () => {

            db = request.result;

            resolve(db);
        };

        request.onupgradeneeded = (event) => {

            db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {

                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: "local_id",
                    autoIncrement: true
                });

                store.createIndex("status_sync", "status_sync", {
                    unique: false
                });

            }

        };

    });

}

async function salvarLocalmente(dados) {

    const transaction = db.transaction([STORE_NAME], "readwrite");

    const store = transaction.objectStore(STORE_NAME);

    store.add(dados);

    return transaction.complete;

}

async function listarRegistros() {

    return new Promise((resolve, reject) => {

        const transaction = db.transaction([STORE_NAME], "readonly");

        const store = transaction.objectStore(STORE_NAME);

        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject("Erro ao listar registros.");
        };

    });

}

async function atualizarRegistro(registro) {

    return new Promise((resolve, reject) => {

        const transaction = db.transaction([STORE_NAME], "readwrite");

        const store = transaction.objectStore(STORE_NAME);

        const request = store.put(registro);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject("Erro ao atualizar registro.");
        };

    });

}

async function buscarRegistro(id) {

    return new Promise((resolve, reject) => {

        const transaction = db.transaction([STORE_NAME], "readonly");

        const store = transaction.objectStore(STORE_NAME);

        const request = store.get(Number(id));

        request.onsuccess = () => {

            resolve(request.result);

        };

        request.onerror = () => {

            reject("Erro ao buscar registro.");

        };

    });

}

async function excluirRegistro(local_id) {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction([STORE_NAME], "readwrite");

        const store =
            transaction.objectStore(STORE_NAME);

        const request =
            store.delete(Number(local_id));

        request.onsuccess = () => {

            resolve();

        };

        request.onerror = () => {

            reject("Erro ao excluir registro.");

        };

    });

}