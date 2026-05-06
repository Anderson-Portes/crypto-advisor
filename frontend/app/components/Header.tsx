"use client";

import { TrendingUp, Wifi, Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

interface Props {
  lastUpdated: Date | null;
}

export default function Header({ lastUpdated }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">CryptoAdvisor</h1>
            <p className="text-xs text-[var(--text-secondary)]">Dashboard Inteligente de Criptomoedas</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Wifi className="w-3 h-3 text-green-400" />
            <span>
              {lastUpdated
                ? `Atualizado às ${lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                : "Carregando..."}
            </span>
          </div>

          <button
            onClick={toggle}
            title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
            className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-blue-500/40 transition-all"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
