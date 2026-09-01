// Client-side shapes for what the APIs return (no server-only imports here).
export type Holding = { name: string; type: string; value: number };

export type MemberView = {
  name: string;
  full_name: string;
  role: string;
  isAdmin: boolean;
  contribution: number;
  units: number;
  share_value: number;
  gain: number;
  return_pct: number;
  monthly: Record<string, number>;
  ownership_pct: number;
  slice: { cash: number; holdings: Holding[] };
};

export type Trade = { date: string; stock: string; pl: number; description?: string };

export type PublicFund = {
  name: string;
  broker: string;
  fund_manager: string;
  start_date: string;
  data_as_of: string;
  total_members: number;
  current_nav: number;
  starting_nav: number;
  total_portfolio: number;
  total_contributions: number;
  total_gain: number;
  overall_return_pct: number;
  cash: number;
  stocks_value: number;
  mutual_funds_value: number;
  total_realized_pl: number;
  total_trades: number;
  nav_history: { month_label: string; nav: number; portfolio: number }[];
  holdings: { stocks: any[]; mutual_funds: { name: string; type: string; invested: number; nav: number }[] };
  trades: { best: Trade[]; worst: Trade[]; latest: Trade };
  months: string[];
};

export type AdminMember = Omit<MemberView, "isAdmin" | "ownership_pct" | "slice"> & { full_name: string };
