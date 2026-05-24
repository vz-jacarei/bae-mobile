async function sincronizarRegistros() {

    await abrirBanco();

    const registros = await listarRegistros();

    const pendentes = registros.filter(
        r => r.status_sync === "pendente"
    );

    if (pendentes.length === 0) {

        alert("Nenhum registro pendente.");

        return;

    }

    let enviados = 0;

    for (const registro of pendentes) {

        try {

            const resposta = await fetch(API_URL, {

                method: "POST",

                body: JSON.stringify(registro)

            });

            const resultado = await resposta.json();
            
            registro.status_sync = "sincronizado";

            registro.id = resultado.id;

            registro.data_sync =
                new Date().toLocaleString("pt-BR");

            await atualizarRegistro(registro);

            enviados++;

        } catch (erro) {

            console.error(erro);

        }

    }

    localStorage.setItem(

        "ultima_sync",

        new Date().toLocaleString("pt-BR")

    ); 
    
    alert(`${enviados} registros sincronizados.`);

    carregarDashboard();

    carregarRegistros();

    carregarUltimaSync();    

}