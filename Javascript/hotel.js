(() => {
	"use strict";

	const HOTEL = "Terabithia";
	const SENHA = "2678";
	const QUANTIDADE_QUARTOS = 20;
	const MAXIMO_HOSPEDES = 15;
	const quartos = new Map();
	const hospedes = [];
	const reservas = [];
	const eventos = [];
	const agenda = [];

	const formatarMoeda = (valor) => valor.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL"
	});

	function erroOpcaoInvalida(opcoes) {
		alert(`Opção inválida. Escolha uma opção entre ${opcoes}.`);
	}

	function lerTexto(mensagem, obrigatorio = true) {
		while (true) {
			const resposta = prompt(mensagem);
			if (resposta === null) return null;

			const texto = resposta.trim();
			if (!obrigatorio || texto.length > 0) return texto;
			alert("Esta informação é obrigatória.");
		}
	}

	function converterNumero(texto) {
		const normalizado = texto.trim().replace(",", ".");
		if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalizado)) return null;
		const valor = Number(normalizado);
		return Number.isFinite(valor) ? valor : null;
	}

	function lerNumero(mensagem, validar, mensagemErro, inteiro = false) {
		while (true) {
			const resposta = prompt(mensagem);
			if (resposta === null) return null;

			const valor = converterNumero(resposta);
			if (valor !== null && (!inteiro || Number.isInteger(valor)) && validar(valor)) return valor;
			alert(mensagemErro);
		}
	}

	function lerConfirmacao(mensagem) {
		while (true) {
			const resposta = prompt(mensagem);
			if (resposta === null) return null;

			const opcao = resposta.trim().toUpperCase();
			if (opcao === "S" || opcao === "N") return opcao;
			alert("Informe S para sim ou N para não.");
		}
	}

	function autenticar() {
		alert(`Bem-vindo ao Hotel ${HOTEL}`);
		const nome = lerTexto("Informe seu nome:");
		if (nome === null) return null;

		for (let tentativa = 1; tentativa <= 3; tentativa += 1) {
			const senha = prompt("Informe sua senha:");
			if (senha === null) return null;
			if (senha === SENHA) {
				alert(`Bem-vindo ao Hotel ${HOTEL}, ${nome}. É um imenso prazer ter você por aqui!`);
				return nome;
			}

			const restantes = 3 - tentativa;
			if (restantes > 0) {
				alert(`Senha incorreta. Você ainda tem ${restantes} tentativa(s).`);
			}
		}

		alert("Acesso bloqueado após 3 tentativas inválidas.");
		return null;
	}

	function mostrarMapaQuartos() {
		const linhas = [];
		for (let inicio = 1; inicio <= QUANTIDADE_QUARTOS; inicio += 5) {
			const linha = [];
			for (let numero = inicio; numero < inicio + 5; numero += 1) {
				linha.push(`${String(numero).padStart(2, "0")}: ${quartos.has(numero) ? "O" : "L"}`);
			}
			linhas.push(linha.join(" | "));
		}
		alert(`Mapa de quartos (L = livre; O = ocupado)\n\n${linhas.join("\n")}`);
	}

	function reservarQuarto(nomeUsuario) {
		alert("[Reservas de Quartos]");
		const diariaTexto = prompt("Informe o valor da diária (maior que zero):");
		if (diariaTexto === null) return;
		const diaria = converterNumero(diariaTexto);
		if (diaria === null || diaria <= 0) {
			alert(`Valor inválido, ${nomeUsuario}.`);
			return;
		}

		const diariasTexto = prompt("Informe a quantidade de diárias (1-30):");
		if (diariasTexto === null) return;
		const diarias = converterNumero(diariasTexto);
		if (diarias === null || !Number.isInteger(diarias) || diarias < 1 || diarias > 30) {
			alert(`Valor inválido, ${nomeUsuario}.`);
			return;
		}

		const hospede = lerTexto("Informe o nome completo do hóspede:");
		if (hospede === null) return;

		let tipo;
		while (tipo === undefined) {
			const resposta = prompt("Tipo de quarto: S (standard), E (executivo) ou L (luxo):");
			if (resposta === null) return;
			const codigo = resposta.trim().toUpperCase();
			if (codigo === "S") tipo = { nome: "Standard", fator: 1 };
			else if (codigo === "E") tipo = { nome: "Executivo", fator: 1.35 };
			else if (codigo === "L") tipo = { nome: "Luxo", fator: 1.65 };
			else alert("Tipo de quarto inválido. Informe S, E ou L.");
		}

		const livres = () => Array.from(
			{ length: QUANTIDADE_QUARTOS },
			(_, indice) => indice + 1
		).filter((numero) => !quartos.has(numero));
		let quarto;
		while (quarto === undefined) {
			const disponiveis = livres();
			if (disponiveis.length === 0) {
				alert("Não há quartos livres no momento.");
				return;
			}
			const resposta = lerNumero(
				`Quartos livres: ${disponiveis.join(", ")}\nEscolha um quarto (1-20):`,
				(valor) => valor >= 1 && valor <= QUANTIDADE_QUARTOS,
				"Informe um número de quarto entre 1 e 20.",
				true
			);
			if (resposta === null) return;
			if (quartos.has(resposta)) {
				alert("Quarto já está ocupado. Escolha outro quarto.");
			} else {
				quarto = resposta;
			}
		}

		const subtotal = diaria * diarias * tipo.fator;
		const taxa = subtotal * 0.1;
		const total = subtotal + taxa;
		const resumo = [
			"Resumo da reserva:",
			`Hóspede: ${hospede}`,
			`Quarto: ${quarto} (${tipo.nome})`,
			`Subtotal: ${formatarMoeda(subtotal)}`,
			`Taxa de serviço (10%): ${formatarMoeda(taxa)}`,
			`Total: ${formatarMoeda(total)}`
		].join("\n");
		alert(resumo);

		const confirmar = lerConfirmacao(`${hospede}, confirma a reserva? (S/N):`);
		if (confirmar === null) return;
		if (confirmar === "N") {
			alert("Reserva não efetuada.");
			return;
		}

		const reserva = { hospede, quarto, diarias, total };
		quartos.set(quarto, reserva);
		reservas.push(reserva);
		alert("Reserva efetuada com sucesso.");
		mostrarMapaQuartos();
	}

	function listarHospedes() {
		const ordenados = [...hospedes].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
		if (ordenados.length === 0) {
			alert("Nenhum hóspede cadastrado.");
			return ordenados;
		}

		alert(`Hóspedes cadastrados:\n\n${ordenados.map((hospede, indice) =>
			`[${indice + 1}] ${hospede.nome} — ${hospede.cadastradoEm.toLocaleString("pt-BR")}`
		).join("\n")}`);
		return ordenados;
	}

	function cadastroHospedes() {
		while (true) {
			const resposta = prompt(
				"[Cadastro de Hóspedes]\n" +
				"1. Cadastrar\n2. Pesquisar por nome exato\n3. Pesquisar por prefixo\n" +
				"4. Listar ordenado (A-Z)\n5. Atualizar cadastro\n6. Remover cadastro\n7. Voltar"
			);
			if (resposta === null) return;

			switch (resposta.trim()) {
				case "1": {
					if (hospedes.length >= MAXIMO_HOSPEDES) {
						alert("Máximo de cadastros atingido");
						break;
					}
					const nome = lerTexto("Nome completo do hóspede:");
					if (nome === null) return;
					if (hospedes.some((hospede) => hospede.nome === nome)) {
						alert("Hóspede já cadastrado");
						break;
					}
					hospedes.push({ nome, cadastradoEm: new Date() });
					alert("Operação realizada com sucesso");
					break;
				}
				case "2": {
					const nome = lerTexto("Informe o nome exato para pesquisa:");
					if (nome === null) return;
					if (hospedes.some((hospede) => hospede.nome === nome)) {
						alert(`Hóspede ${nome} foi encontrado`);
					} else {
						alert("Hóspede não encontrado");
					}
					break;
				}
				case "3": {
					const prefixo = lerTexto("Informe o prefixo para pesquisa:");
					if (prefixo === null) return;
					const encontrados = hospedes.filter((hospede) =>
						hospede.nome.toLocaleLowerCase("pt-BR").startsWith(prefixo.toLocaleLowerCase("pt-BR"))
					);
					alert(encontrados.length
						? `Resultados:\n${encontrados.map((hospede) => `- ${hospede.nome}`).join("\n")}`
						: "Hóspede não encontrado");
					break;
				}
				case "4":
					listarHospedes();
					break;
				case "5":
				case "6": {
					const ordenados = listarHospedes();
					if (ordenados.length === 0) break;
					const indice = lerNumero(
						"Informe o índice do hóspede:",
						(valor) => valor >= 1 && valor <= ordenados.length,
						"Índice inválido.",
						true
					);
					if (indice === null) return;
					const selecionado = ordenados[indice - 1];
					const posicao = hospedes.indexOf(selecionado);

					if (resposta.trim() === "5") {
						const novoNome = lerTexto("Informe o novo nome:");
						if (novoNome === null) return;
						if (hospedes.some((hospede) =>
							hospede !== selecionado && hospede.nome === novoNome
						)) {
							alert("Hóspede já cadastrado");
							break;
						}
						hospedes[posicao] = { ...selecionado, nome: novoNome };
					} else {
						hospedes.splice(posicao, 1);
					}
					alert("Operação realizada com sucesso");
					break;
				}
				case "7":
					return;
				default:
					erroOpcaoInvalida("1 e 7");
			}
		}
	}

	function normalizarDia(dia) {
		return dia.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
	}

	function selecionarAuditorio(convidados) {
		if (convidados <= 220) {
			const extras = Math.max(0, convidados - 150);
			return { nome: "Laranja", capacidade: 220, extras };
		}
		return { nome: "Colorado", capacidade: 350, extras: 0 };
	}

	function eventosHotel() {
		alert("[Eventos]");
		const convidados = lerNumero(
			"Informe o número de convidados (0-350):",
			(valor) => valor >= 0 && valor <= 350,
			"Número de convidados inválido.",
			true
		);
		if (convidados === null) return;
		const auditorio = selecionarAuditorio(convidados);
		if (auditorio.nome === "Laranja" && auditorio.extras > 0) {
			alert(`Auditório selecionado: Laranja (${auditorio.extras} cadeiras adicionais).`);
		} else {
			alert(`Auditório selecionado: ${auditorio.nome}.`);
		}

		const diaInformado = lerTexto("Dia da semana do evento:");
		if (diaInformado === null) return;
		const dia = normalizarDia(diaInformado);
		const diasUteis = ["segunda", "terca", "quarta", "quinta", "sexta"];
		const fimDeSemana = ["sabado", "domingo"];
		const maximoHora = diasUteis.includes(dia) ? 23 : fimDeSemana.includes(dia) ? 15 : null;
		if (maximoHora === null) {
			alert("Dia da semana inválido.");
			return;
		}

		const data = lerTexto("Data do evento (ex.: 25/10/2026):");
		if (data === null) return;
		const horaInicio = lerNumero(
			`Hora inicial (7-${maximoHora}):`,
			(valor) => valor >= 7 && valor <= maximoHora,
			`Informe uma hora inteira entre 7 e ${maximoHora}.`,
			true
		);
		if (horaInicio === null) return;
		const duracao = lerNumero(
			"Duração do evento em horas (1-12):",
			(valor) => valor >= 1 && valor <= 12,
			"A duração deve ser um número inteiro entre 1 e 12.",
			true
		);
		if (duracao === null) return;
		if (horaInicio + duracao > maximoHora) {
			alert(`O evento deve terminar até ${maximoHora}h.`);
			return;
		}

		const conflito = agenda.some((reserva) =>
			reserva.data === data &&
			reserva.auditorio === auditorio.nome &&
			horaInicio < reserva.horaFim &&
			horaInicio + duracao > reserva.horaInicio
		);
		if (conflito) {
			alert("O auditório já está reservado nesse horário.");
			return;
		}

		const empresa = lerTexto("Nome da empresa:");
		if (empresa === null) return;

		const garcons = Math.ceil(convidados / 12) + Math.floor(duracao / 2);
		const custoGarcons = garcons * duracao * 10.5;
		const cafe = convidados * 0.2;
		const agua = convidados * 0.5;
		const salgados = convidados * 7;
		const custoBuffet = cafe * 0.8 + agua * 0.4 + (salgados / 100) * 34;
		const total = custoGarcons + custoBuffet;
		const horaFim = horaInicio + duracao;
		const relatorio = [
			"Relatório do evento",
			`Auditório: ${auditorio.nome}`,
			`Empresa: ${empresa}`,
			`Data: ${data} (${diaInformado})`,
			`Horário: ${String(horaInicio).padStart(2, "0")}h às ${String(horaFim).padStart(2, "0")}h`,
			`Convidados: ${convidados}`,
			`Duração: ${duracao} hora(s)`,
			`Garçons: ${garcons}`,
			`Custo com garçons: ${formatarMoeda(custoGarcons)}`,
			`Buffet: café ${cafe.toFixed(1)} L, água ${agua.toFixed(1)} L, salgados ${salgados} un`,
			`Custo do buffet: ${formatarMoeda(custoBuffet)}`,
			`Total geral: ${formatarMoeda(total)}`
		].join("\n");
		alert(relatorio);

		const confirmar = lerConfirmacao("Confirmar reserva? (S/N):");
		if (confirmar === null) return;
		if (confirmar === "N") {
			alert("Reserva não efetuada.");
			return;
		}

		const evento = { auditorio: auditorio.nome, empresa, data, dia: diaInformado, convidados, garcons, duracao, total };
		eventos.push(evento);
		agenda.push({ data, auditorio: auditorio.nome, horaInicio, horaFim });
		alert("Reserva efetuada com sucesso.");
	}

	function compararArCondicionado(nomeUsuario) {
		alert("[Ar-Condicionado]");
		const orcamentos = [];
		while (true) {
			const empresa = lerTexto("Nome da empresa:");
			if (empresa === null) return;
			const valorAparelho = lerNumero(
				"Valor do serviço por aparelho:",
				(valor) => valor >= 0,
				"Informe um valor igual ou maior que zero."
			);
			if (valorAparelho === null) return;
			const quantidade = lerNumero(
				"Quantidade de aparelhos:",
				(valor) => valor > 0,
				"Informe uma quantidade inteira positiva.",
				true
			);
			if (quantidade === null) return;
			const descontoPercentual = lerNumero(
				"Percentual de desconto (0-100):",
				(valor) => valor >= 0 && valor <= 100,
				"Informe um percentual entre 0 e 100."
			);
			if (descontoPercentual === null) return;
			const quantidadeMinima = lerNumero(
				"Quantidade mínima para desconto:",
				(valor) => valor >= 0,
				"Informe uma quantidade mínima inteira igual ou maior que zero.",
				true
			);
			if (quantidadeMinima === null) return;
			const deslocamento = lerNumero(
				"Valor fixo de deslocamento:",
				(valor) => valor >= 0,
				"Informe um valor igual ou maior que zero."
			);
			if (deslocamento === null) return;

			const bruto = valorAparelho * quantidade;
			const desconto = quantidade >= quantidadeMinima ? bruto * descontoPercentual / 100 : 0;
			const total = bruto - desconto + deslocamento;
			orcamentos.push({ empresa, total });
			alert(`O serviço de ${empresa} custará ${formatarMoeda(total)}.`);

			const continuar = lerConfirmacao(`Deseja informar novos dados, ${nomeUsuario}? (S/N):`);
			if (continuar === null) return;
			if (continuar === "N" && orcamentos.length >= 2) break;
			if (continuar === "N") {
				alert("Informe ao menos duas empresas para comparar os orçamentos.");
			}
		}

		const menor = orcamentos.reduce((atual, item) => item.total < atual.total ? item : atual);
		const maior = orcamentos.reduce((atual, item) => item.total > atual.total ? item : atual);
		const diferenca = menor.total === 0
			? "não calculável quando o menor orçamento é R$ 0,00"
			: `${(((maior.total - menor.total) / menor.total) * 100).toFixed(2)}%`;
		alert([
			`Menor orçamento: ${menor.empresa} — ${formatarMoeda(menor.total)}`,
			`Maior orçamento: ${maior.empresa} — ${formatarMoeda(maior.total)}`,
			`Diferença percentual: ${diferenca}`
		].join("\n"));
	}

	function analisarAbastecimento(nome) {
		alert("[Abastecimento]");
		const postos = [];
		for (const posto of ["Wayne Oil", "Stark Petrol"]) {
			const alcool = lerNumero(
				`Preço do álcool no ${posto}:`,
				(valor) => valor > 0,
				"Informe um preço maior que zero."
			);
			if (alcool === null) return;
			const gasolina = lerNumero(
				`Preço da gasolina no ${posto}:`,
				(valor) => valor > 0,
				"Informe um preço maior que zero."
			);
			if (gasolina === null) return;

			const combustivel = alcool <= gasolina * 0.7 ? "Álcool" : "Gasolina";
			const preco = combustivel === "Álcool" ? alcool : gasolina;
			postos.push({ nome: posto, combustivel, total: preco * 42 });
		}

		postos.sort((a, b) => a.total - b.total);
		const resultado = postos.map((posto) =>
			`${posto.nome}: melhor opção = ${posto.combustivel} | Total (42 L) = ${formatarMoeda(posto.total)}`
		).join("\n");
		const menorPreco = postos[0].total;
		const melhores = postos.filter((posto) => posto.total === menorPreco);
		const escolha = melhores.length === 1
			? `é mais barato abastecer com ${melhores[0].combustivel.toLowerCase()} no posto ${melhores[0].nome}.`
			: `há empate entre os postos ${melhores.map((posto) => posto.nome).join(" e ")}.`;
		alert(`${resultado}\n\n${nome}, ${escolha}`);
	}

	function exibirRelatorios() {
		const ocupados = quartos.size;
		const receitaHospedagem = reservas.reduce((total, reserva) => total + reserva.total, 0);
		const receitaEventos = eventos.reduce((total, evento) => total + evento.total, 0);
		const receitaTotal = receitaHospedagem + receitaEventos;
		alert([
			"[Relatórios Operacionais]",
			`Reservas de quartos confirmadas: ${reservas.length}`,
			`Ocupação atual: ${ocupados}/${QUANTIDADE_QUARTOS} (${(ocupados / QUANTIDADE_QUARTOS * 100).toFixed(1)}%)`,
			`Hóspedes cadastrados: ${hospedes.length}`,
			`Eventos confirmados: ${eventos.length}`,
			`Receita de hospedagem: ${formatarMoeda(receitaHospedagem)}`,
			`Receita de eventos: ${formatarMoeda(receitaEventos)}`,
			`Receita total: ${formatarMoeda(receitaTotal)}`
		].join("\n"));
	}

	function executar() {
		const nome = autenticar();
		if (nome === null) return;

		while (true) {
			const resposta = prompt(
				`Hotel ${HOTEL} — Menu Principal\n\n` +
				"1. Reservas de Quartos\n2. Cadastro de Hóspedes\n3. Eventos\n" +
				"4. Ar-Condicionado\n5. Abastecimento\n6. Relatórios Operacionais\n7. Sair"
			);
			if (resposta === null) {
				alert(`Muito obrigado e até logo, ${nome}.`);
				return;
			}

			switch (resposta.trim()) {
				case "1":
					reservarQuarto(nome);
					break;
				case "2":
					cadastroHospedes();
					break;
				case "3":
					eventosHotel();
					break;
				case "4":
					compararArCondicionado(nome);
					break;
				case "5":
					analisarAbastecimento(nome);
					break;
				case "6":
					exibirRelatorios();
					break;
				case "7":
					alert(`Muito obrigado e até logo, ${nome}.`);
					return;
				default:
					erroOpcaoInvalida("1 e 7");
			}
		}
	}

	executar();
})();
