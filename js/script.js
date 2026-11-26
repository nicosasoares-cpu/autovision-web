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

const vehicleSearchForm =
    document.getElementById("vehicleSearchForm");

if (vehicleSearchForm) {

    const makeInput =
        document.getElementById("vehicleMake");

    const yearInput =
        document.getElementById("vehicleYear");

    const status =
        document.getElementById("vehicleSearchStatus");

    const resultsList =
        document.getElementById("vehicleResults");

    const searchButton =
        document.getElementById("vehicleSearchButton");

    const clearButton =
        document.getElementById("vehicleClearButton");

    const maxYear = new Date().getFullYear() + 1;
    const resultLimit = 50;

    let searching = false;

    yearInput.max = String(maxYear);

    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    vehicleSearchForm.addEventListener("reset", function () {

        resultsList.replaceChildren();
        status.textContent = "";

    });

    vehicleSearchForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (searching) {
            return;
        }

        const make = makeInput.value.trim();
        const year = yearInput.value.trim();

        resultsList.replaceChildren();

        const validMake =
            /^[\p{L}\p{N} .&'-]{2,50}$/u;

        if (!validMake.test(make)) {

            status.textContent =
                "Informe uma fabricante válida.";

            makeInput.focus();

            return;
        }

        if (year !== "") {

            const numericYear = Number(year);

            if (
                !Number.isInteger(numericYear) ||
                numericYear < 1996 ||
                numericYear > maxYear
            ) {

                status.textContent =
                    `Informe um ano entre 1996 e ${maxYear}.`;

                yearInput.focus();

                return;
            }
        }

        searching = true;

        searchButton.disabled = true;
        clearButton.disabled = true;

        searchButton.textContent = "Pesquisando...";

        status.textContent =
            "Consultando a base de dados automotiva...";

        vehicleSearchForm.setAttribute("aria-busy", "true");

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 15000);

        try {

            const baseUrl =
                "https://vpic.nhtsa.dot.gov/api/vehicles";

            const encodedMake =
                encodeURIComponent(make);

            const url = year

                ? `${baseUrl}/GetModelsForMakeYear/make/${encodedMake}/modelyear/${year}?format=json`

                : `${baseUrl}/GetModelsForMake/${encodedMake}?format=json`;

            const response = await fetch(url, {
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data.Results)) {
                throw new Error("Resposta inválida da API.");
            }

            const uniqueModels = [
                ...new Map(
                    data.Results
                        .filter(model =>
                            typeof model.Model_Name === "string" &&
                            model.Model_Name.trim() !== ""
                        )
                        .map(model => [
                            model.Model_Name.trim().toLowerCase(),
                            model.Model_Name.trim()
                        ])
                ).values()
            ];

            uniqueModels.sort((a, b) =>
                a.localeCompare(b, "pt-BR")
            );

            if (uniqueModels.length === 0) {

                status.textContent =
                    "Nenhum modelo encontrado. Verifique os dados informados.";

                return;
            }

            const fragment =
                document.createDocumentFragment();

            uniqueModels.slice(0, resultLimit).forEach(modelName => {

                const item =
                    document.createElement("li");

                item.textContent = modelName;

                fragment.appendChild(item);

            });

            resultsList.appendChild(fragment);

            const yearDescription =
                year ? ` no ano de ${year}` : "";

            status.textContent =
                `${uniqueModels.length} modelo(s) encontrado(s) para ${make}${yearDescription}.`;

            if (uniqueModels.length > resultLimit) {

                status.textContent +=
                    ` Exibindo os primeiros ${resultLimit}.`;

            }

        } catch (error) {

            if (error.name === "AbortError") {

                status.textContent =
                    "A consulta demorou muito. Tente novamente.";

            } else {

                status.textContent =
                    "Não foi possível consultar a API. Verifique sua conexão.";

            }

            console.error("Erro na consulta automotiva:", error);

        } finally {

            clearTimeout(timeout);

            searching = false;

            searchButton.disabled = false;
            clearButton.disabled = false;

            searchButton.textContent = "Buscar modelos";

            vehicleSearchForm.setAttribute("aria-busy", "false");

        }
    });
}
