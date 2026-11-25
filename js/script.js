// =========================================
// AUTOVISION - FUNCIONALIDADES JAVASCRIPT
// =========================================


// =========================================
// FORMULÁRIO DE CONTATO
// =========================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    const nomeInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const assuntoInput = document.getElementById("assunto");
    const mensagemInput = document.getElementById("mensagem");
    const feedback = document.getElementById("contactFeedback");

    // Exibe uma mensagem de erro e direciona o foco
    // para o campo que precisa ser corrigido.

    function mostrarErro(mensagem, campo) {

        feedback.textContent = mensagem;

        campo.focus();
    }

    // Limpa o feedback quando o usuário altera os campos.

    contactForm.addEventListener("input", function () {

        feedback.textContent = "";

    });

    // Validação dos dados do formulário.

    contactForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const nome = nomeInput.value.trim();
        const email = emailInput.value.trim();
        const assunto = assuntoInput.value;
        const mensagem = mensagemInput.value.trim();

        // Validação do nome.

        if (nome.length < 3 || nome.length > 100) {

            mostrarErro(
                "Informe um nome com 3 a 100 caracteres.",
                nomeInput
            );

            return;
        }

        // Validação do endereço de e-mail.

        const emailValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailValido.test(email) || email.length > 150) {

            mostrarErro(
                "Informe um endereço de e-mail válido.",
                emailInput
            );

            return;
        }

        // Validação do assunto.

        const assuntosPermitidos = [
            "Duvida",
            "Sugestao",
            "Elogio",
            "Outro"
        ];

        if (!assuntosPermitidos.includes(assunto)) {

            mostrarErro(
                "Selecione um assunto válido.",
                assuntoInput
            );

            return;
        }

        // Validação da mensagem.

        if (mensagem.length < 10 || mensagem.length > 1000) {

            mostrarErro(
                "A mensagem deve conter entre 10 e 1000 caracteres.",
                mensagemInput
            );

            return;
        }

        // Limpa os campos após a validação.

        contactForm.reset();

        // Confirmação da validação acadêmica.
        // Nenhum dado é enviado para um servidor.

        feedback.textContent =
            `Obrigado, ${nome}! Seus dados foram validados com sucesso. ` +
            "Este formulário é demonstrativo e nenhuma mensagem foi enviada.";

    });

}


// =========================================
// CONSULTA DE MODELOS PELA API AUTOMOTIVA
// =========================================

const vehicleSearchForm = document.getElementById("vehicleSearchForm");

if (vehicleSearchForm) {

    vehicleSearchForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const makeInput = document.getElementById("vehicleMake");
        const status = document.getElementById("vehicleSearchStatus");
        const resultsList = document.getElementById("vehicleResults");
        const searchButton = vehicleSearchForm.querySelector("button");

        const make = makeInput.value.trim();

        if (!make) {
            status.textContent = "Digite o nome de uma fabricante.";
            return;
        }

        resultsList.replaceChildren();
        status.textContent = "Buscando modelos...";

        searchButton.disabled = true;
        searchButton.textContent = "Pesquisando...";

        try {
            const url =
                `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(make)}?format=json`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Não foi possível consultar a API.");
            }

            const data = await response.json();

            const models = Array.isArray(data.Results)
                ? data.Results
                : [];

            const uniqueModels = [
                ...new Map(
                    models
                        .filter(model => model.Model_Name)
                        .map(model => [
                            model.Model_Name.toLowerCase(),
                            model.Model_Name
                        ])
                ).values()
            ];

            uniqueModels.sort((a, b) =>
                a.localeCompare(b, "pt-BR")
            );

            if (uniqueModels.length === 0) {
                status.textContent =
                    "Nenhum modelo encontrado. Tente outra fabricante.";
                return;
            }

            const limit = 50;

            uniqueModels.slice(0, limit).forEach(modelName => {
                const item = document.createElement("li");
                item.textContent = modelName;
                resultsList.appendChild(item);
            });

            status.textContent =
                `Encontramos ${uniqueModels.length} modelo(s) para ${make}.`;

            if (uniqueModels.length > limit) {
                const note = document.createElement("li");
                note.textContent =
                    `Exibindo os primeiros ${limit} modelos.`;
                resultsList.appendChild(note);
            }

        } catch (error) {
            status.textContent =
                "Não foi possível acessar a API. Verifique sua conexão e tente novamente.";

            console.error("Erro na consulta automotiva:", error);

        } finally {
            searchButton.disabled = false;
            searchButton.textContent = "Buscar modelos";
        }
    });
}