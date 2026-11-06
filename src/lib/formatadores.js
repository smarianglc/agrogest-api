function formatarFazenda(fazenda) {
  return {
    id: fazenda.id,
    nome: fazenda.nome,
    cidade: fazenda.cidade,
    areaTotalHa: fazenda.areaTotalHa.toFixed(2),
    criadoEm: fazenda.criadoEm,
  };
}

function formatarInsumo(insumo) {
  return {
    id: insumo.id,
    fazendaId: insumo.fazendaId,
    nome: insumo.nome,
    categoria: insumo.categoria,
    unidade: insumo.unidade,
    especificacao: insumo.especificacao,
    lote: insumo.lote,
    validade: insumo.validade ? insumo.validade.toISOString().slice(0, 10) : null,
    saldo: insumo.saldo.toFixed(3),
    custoMedio: insumo.custoMedio.toFixed(2),
    estoqueMinimo: insumo.estoqueMinimo.toFixed(3),
    emAlerta: insumo.saldo.lt(insumo.estoqueMinimo), // RN-07
  };
}

function formatarEntrada(entrada) {
  return {
    id: entrada.id,
    insumoId: entrada.insumoId,
    numeroNota: entrada.numeroNota,
    fornecedor: entrada.fornecedor,
    quantidade: entrada.quantidade.toFixed(3),
    valorTotal: entrada.valorTotal.toFixed(2),
    dataEmissao: entrada.dataEmissao.toISOString().slice(0, 10),
    numeroParcelas: entrada.numeroParcelas,
  };
}

module.exports = { formatarFazenda, formatarInsumo, formatarEntrada };
