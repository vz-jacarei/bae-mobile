const API_URL = "https://script.google.com/macros/s/AKfycby51RFskDjngbA31ow4P_eGpZ4ewkiQ1b3ZYEgO9xIFs5iZzypg5hre9P0x5BfTCdMg/exec";

async function carregarDashboard() {

    await abrirBanco();

    const registros = await listarRegistros();   

    const pendentes = registros.filter(
        r => r.status_sync === "pendente"
    ).length;

    const enviados = registros.filter(
        r => r.status_sync === "sincronizado"
    ).length;

    document.getElementById("totalPendentes").innerText =
        pendentes;

    document.getElementById("totalEnviados").innerText =
        enviados;

    document.getElementById("totalRegistros").innerText =
        registros.length;

    const ultimaSync = localStorage.getItem("ultima_sync");

    document.getElementById("ultimaSync").innerText =
        ultimaSync || "Nunca";

}

function carregarUltimaSync() {

    const ultimaSync =
        localStorage.getItem("ultima_sync");

    const campoDashboard =
        document.getElementById("ultimaSync");

    const campoSync =
        document.getElementById("ultimaSyncSync");

    if (campoDashboard) {

        campoDashboard.innerText =
            ultimaSync || "Nunca";

    }

    if (campoSync) {

        campoSync.innerText =
            ultimaSync || "Nunca";

    }

}

async function carregarRegistros() {

    await abrirBanco();

    const registros = await listarRegistros();

    const campoBusca =
        document.getElementById("buscaRegistro");

    if (campoBusca && campoBusca.value.trim()) {

        const termo =
            campoBusca.value.toLowerCase();

        registrosFiltrados = registros.filter(registro => {

            return (

                registro.local.toLowerCase().includes(termo)

                ||

                registro.data.includes(termo)

                ||

                registro.status_sync.toLowerCase().includes(termo)                

            );

        });

    } else {

        registrosFiltrados = registros;

    }    

    registrosFiltrados.sort((a, b) => {

        const dataA = a.data.split("/").reverse().join("");

        const dataB = b.data.split("/").reverse().join("");

        return dataB.localeCompare(dataA);

    });

    const lista = document.getElementById("listaRegistros");

    if (!lista) return;

    lista.innerHTML = "";

    registrosFiltrados.forEach(registro => {

        const card = document.createElement("div");

        card.className = "card-formulario";

        card.style.cursor = "pointer";

        card.onclick = () => {

            window.location.href =
                `novo.html?id=${registro.local_id}`;

        };

        card.innerHTML = `

            <div class="linha-registro-topo">

                <span>
                    <strong>Data:</strong> ${registro.data}
                </span>

                <span>
                    <strong>ID:</strong> ${registro.id || "-"}
                </span>

            </div>

            <div class="registro-local">

                ${registro.local}

            </div>

            <div class="linha-registro-rodape">

                <span>
                    <strong>Status:</strong>

                    <span class="status-${registro.status_sync}">

                        ${registro.status_sync}

                    </span>
                </span>

                ${registro.status_sync === "sincronizado"
                    ? `<button class="btn-excluir">
                            Excluir
                    </button>`
                    : ""
                }

            </div>

        `;

        lista.appendChild(card);

        const btnExcluir =
            card.querySelector(".btn-excluir");

        if (btnExcluir) {

            btnExcluir.addEventListener(
                "click",
                async function (event) {

                    event.stopPropagation();

                    const confirmar = confirm(
                        "Excluir registro local?"
                    );

                    if (!confirmar) return;

                    try {

                        await excluirRegistro(
                            registro.local_id
                        );

                        carregarRegistros();

                    } catch (erro) {

                        console.error(erro);

                        alert("Erro ao excluir.");

                    }

                }
            );

        }        

    });

}

async function carregarDetalhes() {

    await abrirBanco();

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if (!id) return;

    const registro = await buscarRegistro(id);

    const detalhes = document.getElementById("detalhesRegistro");

    if (!detalhes) return;

    detalhes.innerHTML = `

        <div class="card-formulario">

            <p><strong>ID:</strong> ${registro.id || "-"}</p>

            <p><strong>Local:</strong> ${registro.local}</p>

            <p><strong>Data:</strong> ${registro.data}</p>

            <p><strong>Status:</strong> ${registro.status_sync}</p>

            <p><strong>Responsável:</strong> ${registro.responsavel_local}</p>

            <p><strong>Bairro:</strong> ${registro.bairro}</p>

            <p><strong>Observações:</strong> ${registro.observacoes}</p>

        </div>

    `;

}

async function carregarFormulario() {

    await abrirBanco();

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if (!id) return;

    const registro = await buscarRegistro(id);

    if (!registro) return;

    Object.keys(registro).forEach(chave => {

        const campo = document.getElementById(chave);

        if (!campo) return;

        if (campo.type === "checkbox") {

            campo.checked = registro[chave] === "Sim";

        } else {

            campo.value = registro[chave];

        }

    });

    if (registro.data) {

        document.getElementById("data").value =
            registro.data.split("/").reverse().join("-");

    }

    if (registro.coordenadas) {

        const partes = registro.coordenadas.split(",");

        document.getElementById("latitude").value =
            partes[0];

        document.getElementById("longitude").value =
            partes[1];

    }

    if (registro.status_sync === "pendente") {

        const botaoEditar = document.createElement("button");

        botaoEditar.classList.add("botao-editar");

        botaoEditar.innerText = "Editar";

        botaoEditar.type = "button";

        botaoEditar.onclick = () => {

            desbloquearFormulario();

        };

        const titulo = document.querySelector("h1");

        titulo.insertAdjacentElement(
            "afterend",
            botaoEditar
        );

    }

    bloquearFormulario();

}

function bloquearFormulario() {

    const campos = document.querySelectorAll(

        "input, select, textarea, button"

    );

    campos.forEach(campo => {

        if (
            campo.classList.contains("botao-editar")
        ) {
            return;
        }

        campo.disabled = true;

        campo.readOnly = true;

    });

}

function desbloquearFormulario() {

    const campos = document.querySelectorAll(

        "input, select, textarea, button"

    );

    campos.forEach(campo => {

        campo.disabled = false;

        campo.readOnly = false;

    });

}

async function iniciarSistema() {

    await abrirBanco();

    console.log("Banco IndexedDB iniciado");

    if (window.location.pathname.includes("index.html")
        || window.location.pathname === "/") {

        carregarDashboard();

    }

}

iniciarSistema();

carregarUltimaSync();

atualizarStatusConexao();

window.addEventListener(
    "online",
    atualizarStatusConexao
);

window.addEventListener(
    "offline",
    atualizarStatusConexao
);

    if (window.location.pathname.includes("registros.html")) {

        carregarRegistros();

    }

    if (window.location.pathname.includes("detalhe.html")) {

        carregarDetalhes();

    }

    if (window.location.pathname.includes("novo.html")) {

        carregarFormulario();

    }    

function atualizarStatusConexao() {

    const status =
        document.getElementById("statusConexao");

    if (!status) return;

    if (navigator.onLine) {

        status.innerHTML = `

            <img
                src="icons/online.png"
                class="icone-status"
            >

        `;

    } else {

        status.innerHTML = `

            <img
                src="icons/offline.png"
                class="icone-status"
            >

        `;

    }

}

const btnSalvar = document.getElementById("btnSalvar");

if (btnSalvar) {

    btnSalvar.addEventListener("click", salvarRegistro);

}

const tipoDocumento = document.getElementById("tipo_documento");

if (tipoDocumento) {

    tipoDocumento.addEventListener("change", function () {

        const valor = this.value;

        const campoOutro = document.getElementById("campoOutroDocumento");

        if (valor === "OUTROS") {

            campoOutro.style.display = "block";

        } else {

            campoOutro.style.display = "none";

        }

    });

}

const finalidade = document.getElementById("finalidade");

if (finalidade) {

    finalidade.addEventListener("change", function () {

        const valor = this.value;

        const campoOutra = document.getElementById("campoOutraFinalidade");

        if (valor === "Outra") {

            campoOutra.style.display = "block";

        } else {

            campoOutra.style.display = "none";

        }

    });

}




async function salvarRegistro() {

    const data = document.getElementById("data").value;

    const local = document.getElementById("local").value;

    if (!data || !local) {

        alert("Preencha Data e Local.");

        return;

    }

    const dataFormatada = data.split("-").reverse().join("/");

    const params = new URLSearchParams(window.location.search);

    const idEdicao = params.get("id");    

    const dados = {
        responsavel_local: document.getElementById("responsavel_local").value,
        data: dataFormatada,
        tipo_documento: document.getElementById("tipo_documento").value,
        especificar_documento: document.getElementById("especificar_documento").value,
        numero_documento: document.getElementById("numero_documento").value,
        finalidade: document.getElementById("finalidade").value,
        outra_finalidade: document.getElementById("outra_finalidade").value,
        telefone_responsavel: document.getElementById("telefone_responsavel").value,
        rua_avenida: document.getElementById("rua_avenida").value,
        numero_complemento: document.getElementById("numero_complemento").value,
        local: document.getElementById("local").value,
        bairro: document.getElementById("bairro").value,
        area_m2: document.getElementById("area_m2").value,
        area: document.getElementById("area").value,
        sc: document.getElementById("sc").value,
        quadra: document.getElementById("quadra").value,
        coordenadas:
            document.getElementById("latitude").value +
            "," +
            document.getElementById("longitude").value,        
        ambiente: document.getElementById("ambiente").value,
        periodo: document.getElementById("periodo").value,
        estacao: document.getElementById("estacao").value,
        temperatura: document.getElementById("temperatura").value,
        umidade: document.getElementById("umidade").value,
        lua: document.getElementById("lua").value,
        alteracao_ambiente: document.getElementById("alteracao_ambiente").value,
        especimes_encontrados: document.querySelector('input[name="especimes_encontrados"]:checked').value,
        mortos_local: document.getElementById("mortos_local").value,
        exuvias: document.getElementById("exuvias").value,
        fuga: document.getElementById("fuga").value,
        tityus_serrulatus: document.getElementById("tityus_serrulatus").checked ? "Sim" : "Não",
        tityus_stigmurus: document.getElementById("tityus_stigmurus").checked ? "Sim" : "Não",
        tityus_bahiensis: document.getElementById("tityus_bahiensis").checked ? "Sim" : "Não",
        outra_especie: document.getElementById("outra_especie").checked ? "Sim" : "Não",
        descricao_outra_especie: document.getElementById("descricao_outra_especie").value,        
        numero_amostra: document.getElementById("numero_amostra").value,
        vivos: document.getElementById("vivos").value,
        mortos: document.getElementById("mortos").value,
        observacoes: document.getElementById("observacoes").value,
        descricao_vistoria: document.getElementById("descricao_vistoria").value,
        recomendacoes: document.getElementById("recomendacoes").value,
        motorista: document.getElementById("motorista").value,
        checagem_materiais_ida: document.getElementById("checagem_materiais_ida").value,
        checagem_materiais_volta: document.getElementById("checagem_materiais_volta").value,
        sistema_scorpio: document.getElementById("sistema_scorpio").value,
        relatorio: document.getElementById("relatorio").value,        
        status_sync: "pendente"
    };

    try {

        console.log("Tentando salvar...");
        console.log(dados);
        
    if (idEdicao) {

        dados.local_id = Number(idEdicao);

        await atualizarRegistro(dados);

    } else {

        await salvarLocalmente(dados);

    }

        alert("Registro salvo localmente!");

        if (!idEdicao) {

            document.getElementById("formularioBAE").reset();

        }        

        console.log(dados);

    } catch (erro) {

        console.error(erro);

        alert("Erro ao salvar registro.");

    }

}

        const radiosEspecimes = document.getElementsByName("especimes_encontrados");

        if (radiosEspecimes.length > 0) {

            radiosEspecimes.forEach(radio => {

                radio.addEventListener("change", function () {

                    const bloco = document.getElementById("blocoEspecimes");

                    if (this.value === "Sim") {

                        bloco.style.display = "block";

                    } else {

                        bloco.style.display = "none";

                    }

                });

            });

        }

        const outraEspecie = document.getElementById("outra_especie");

        if (outraEspecie) {

            outraEspecie.addEventListener("change", function () {

                const campo = document.getElementById("campoOutraEspecie");

                if (this.checked) {

                    campo.style.display = "block";

                } else {

                    campo.style.display = "none";

                }

            });

        } 
        
        const btnGPS = document.getElementById("btnGPS");

        if (btnGPS) {

            btnGPS.addEventListener("click", function () {

                if (!navigator.geolocation) {

                    alert("GPS não suportado neste dispositivo.");
                    return;

                }

                navigator.geolocation.getCurrentPosition(

                    function (position) {

                        document.getElementById("latitude").value =
                            position.coords.latitude.toFixed(8);

                        document.getElementById("longitude").value =
                            position.coords.longitude.toFixed(8);

                    },

                    function () {

                        alert("Não foi possível obter a localização.");

                    }

                );

            });

        }        

        const campoBusca =
            document.getElementById("buscaRegistro");

        if (campoBusca) {

            campoBusca.addEventListener(
                "input",
                carregarRegistros
            );

        }     