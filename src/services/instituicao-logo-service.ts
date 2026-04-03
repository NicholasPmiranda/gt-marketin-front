export type InstituicaoOpcao = {
  nome: string
  arquivo: string
}

const opcoes: InstituicaoOpcao[] = [
  { nome: "118118 Money", arquivo: "118118-money.png" },
  { nome: "99Pay", arquivo: "99Pay.png" },
  { nome: "American Express", arquivo: "amex.png" },
  { nome: "Asaas", arquivo: "asaas.png" },
  { nome: "Banco do Brasil", arquivo: "bb.png" },
  { nome: "Bradesco", arquivo: "bradesco.png" },
  { nome: "BRB", arquivo: "brb.png" },
  { nome: "BTG Pactual", arquivo: "btgpactual.png" },
  { nome: "Banco BV", arquivo: "bv.png" },
  { nome: "C6 Bank", arquivo: "c6bank.png" },
  { nome: "Caixa", arquivo: "caixa.png" },
  { nome: "Inter", arquivo: "intermedium.png" },
  { nome: "Itau", arquivo: "itau.png" },
  { nome: "Itau Personnalite", arquivo: "itaupersonnalite.png" },
  { nome: "Nubank", arquivo: "nubank.png" },
  { nome: "PicPay", arquivo: "picpay.png" },
  { nome: "Safra", arquivo: "safra.png" },
  { nome: "Santander", arquivo: "santander.png" },
  { nome: "Wise", arquivo: "wise.png" },
  { nome: "XP", arquivo: "xp.png" },
]

function normalizar(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
}

const mapaAlias = new Map<string, string>(
  opcoes.flatMap((item) => {
    const base = normalizar(item.nome)
    const semExtensao = normalizar(item.arquivo.replace(/\.[a-zA-Z0-9]+$/, ""))
    return [
      [base, item.arquivo],
      [semExtensao, item.arquivo],
    ]
  })
)

export function listarInstituicoes() {
  return opcoes
}

export function obterLogoInstituicao(instituicao: string) {
  const chave = normalizar(instituicao)
  const arquivo = mapaAlias.get(chave)

  if (!arquivo) {
    return "/bancos/bb.png"
  }

  return `/bancos/${arquivo}`
}
