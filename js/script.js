// =========================================
// FORMULÁRIO DE CONTATO
// =========================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const feedback = document.getElementById("contactFeedback");

        if (nome === "") {
            feedback.textContent = "Por favor, informe seu nome.";
            return;
        }

        feedback.textContent = "Mensagem enviada com sucesso! Obrigado pelo contato.";

        contactForm.reset();
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