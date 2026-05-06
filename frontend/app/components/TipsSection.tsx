"use client";

import { Lightbulb, ShieldAlert, TrendingUp, BookOpen, Wallet, Repeat } from "lucide-react";

const TIPS = [
  {
    icon: ShieldAlert,
    color: "text-red-400 bg-red-500/10",
    title: "Nunca invista o que não pode perder",
    body: "O mercado cripto é altamente volátil. Reserve apenas uma parcela do seu patrimônio e mantenha uma reserva de emergência intacta.",
  },
  {
    icon: Wallet,
    color: "text-green-400 bg-green-500/10",
    title: "Diversifique sua carteira",
    body: "Não concentre todo capital em uma única moeda. Distribua entre ativos de diferentes riscos: BTC, ETH e altcoins selecionadas.",
  },
  {
    icon: TrendingUp,
    color: "text-blue-400 bg-blue-500/10",
    title: "Dollar Cost Averaging (DCA)",
    body: "Comprar em intervalos regulares (semanal/mensal) reduz o impacto da volatilidade e elimina a necessidade de acertar o timing do mercado.",
  },
  {
    icon: BookOpen,
    color: "text-yellow-400 bg-yellow-500/10",
    title: "Pesquise antes de investir",
    body: "Leia whitepapers, analise o time do projeto, entenda o caso de uso real e verifique a liquidez antes de aportar em qualquer ativo.",
  },
  {
    icon: Repeat,
    color: "text-cyan-400 bg-cyan-500/10",
    title: "Segurança das suas chaves",
    body: "Use carteiras hardware para grandes valores. Nunca compartilhe sua seed phrase. Ative 2FA em todas as exchanges.",
  },
  {
    icon: Lightbulb,
    color: "text-purple-400 bg-purple-500/10",
    title: "Cuidado com FOMO e FUD",
    body: "Emoções são os maiores inimigos do investidor. Tenha um plano, defina metas de saída e evite decisões por impulso em momentos de euforia ou pânico.",
  },
];

export default function TipsSection() {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-white flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-yellow-400" />
        Dicas de Investimento
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TIPS.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <div
              key={i}
              className="card-glow bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 fade-in"
            >
              <div className={`inline-flex p-2 rounded-lg ${tip.color.split(" ")[1]} mb-3`}>
                <Icon className={`w-4 h-4 ${tip.color.split(" ")[0]}`} />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1.5">{tip.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{tip.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
